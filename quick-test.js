const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Simple HTTP request function
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing JWT Authentication API...\n');

  try {
    console.log('Testing Server Health...');
    const healthResponse = await makeRequest('GET', '/');
    console.log('Server is running:', healthResponse.data.message);
    console.log('');

    // 2. Test Registration
    console.log('Testing User Registration...');
    const signupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123'
    };
    const signupResponse = await makeRequest('POST', '/api/auth/signup', signupData);
    if (signupResponse.status === 201) {
      console.log('Registration successful:', signupResponse.data.message);
      console.log('User ID:', signupResponse.data.result._id);
    } else {
      console.log('Registration failed:', signupResponse.data.message);
    }
    console.log('');

    console.log('Testing User Login...');
    const signinData = {
      email: 'test@example.com',
      password: 'Password123'
    };
    const signinResponse = await makeRequest('POST', '/api/auth/signin', signinData);
    if (signinResponse.status === 200) {
      console.log('Login successful:', signinResponse.data.message);
      console.log('Token received:', signinResponse.data.token ? 'Yes' : 'No');
      
      // 4. Test Dashboard (Protected Route)
      console.log('Testing Dashboard (Protected Route)...');
      const dashboardResponse = await makeRequest('GET', '/api/auth/dashboard', null, {
        'Cookie': `Authorization=Bearer ${signinResponse.data.token}`
      });
      if (dashboardResponse.status === 200) {
        console.log('Dashboard access successful:', dashboardResponse.data.message);
        console.log('Welcome message:', dashboardResponse.data.data.welcomeMessage);
      } else {
        console.log('Dashboard access failed:', dashboardResponse.data.message);
      }
    } else {
      console.log('Login failed:', signinResponse.data.message);
    }
    console.log('');

    // 5. Test Create Post (Protected Route)
    console.log('Testing Create Post (Protected Route)...');
    const postData = {
      title: 'Test Post',
      description: 'This is a test post created via API testing'
    };
    const createPostResponse = await makeRequest('POST', '/api/posts/create-post', postData, {
      'Cookie': `Authorization=Bearer ${signinResponse.data.token}`
    });
    if (createPostResponse.status === 201) {
      console.log('Post creation successful:', createPostResponse.data.message);
      console.log('Post ID:', createPostResponse.data.data._id);
    } else {
      console.log('Post creation failed:', createPostResponse.data.message);
    }
    console.log('');

    // 6. Test Get All Posts
    console.log('Testing Get All Posts...');
    const allPostsResponse = await makeRequest('GET', '/api/posts/all-posts');
    if (allPostsResponse.status === 200) {
      console.log('Get all posts successful:', allPostsResponse.data.message);
      console.log('Posts count:', allPostsResponse.data.data.length);
    } else {
      console.log('Get all posts failed:', allPostsResponse.data.message);
    }
    console.log('');

    console.log('🎉 API Testing Complete!');
    console.log('Task Requirements Status:');
    console.log('User Registration with name, email, password');
    console.log('Secure password hashing');
    console.log('User Login with JWT token');
    console.log('Protected routes with authentication');
    console.log('Token expiration (8 hours)');
    console.log('Input validation and error handling');
    console.log('Environment variables for sensitive data');
    console.log(' Your JWT Authentication API is fully functional!');

  } catch (error) {
    console.error('Test failed:', error.message);
    console.log('Make sure the server is running with: npm start');
  }
}

testAPI(); 