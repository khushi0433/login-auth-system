# User Authentication API with JWT

A secure RESTful API built with Node.js, Express, and MongoDB that implements user authentication using JSON Web Tokens (JWT).

## Features

- User Registration with name, email, and password
- Secure password hashing with bcrypt
- User Login with JWT token generation
- Protected routes with JWT authentication
- Token expiration (8 hours)
- Input validation and error handling
- Environment variables for sensitive data
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/khushi0433/User-auth-api>
   cd auth_login
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URL=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database?retryWrites=true&w=majority
   TOKEN_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

## API Endpoints

### Base URL: `http://localhost:3000`

### Authentication Routes

#### 1. User Registration
- **POST** `/api/auth/signup`
- **Body:**
  ```json
  {
    "name": "ali khan",
    "email": "ali@example.com",
    "password": "Password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Your account has been created successfully",
    "result": {
      "_id": "user_id",
      "name": "ali khan",
      "email": "ali khan@example.com",
      "verified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 2. User Login
- **POST** `/api/auth/signin`
- **Body:**
  ```json
  {
    "email": "ali@example.com",
    "password": "Password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "jwt_token_here",
    "message": "logged in successfully"
  }
  ```

#### 3. User Dashboard (Protected Route)
- **GET** `/api/auth/dashboard`
- **Headers:**
  ```
  Cookie: Authorization=Bearer jwt_token_here
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Dashboard data retrieved successfully",
    "data": {
      "user": {
        "id": "user_id",
        "name": "ali khan",
        "email": "ali@example.com",
        "verified": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "welcomeMessage": "Welcome back, ali khan",
      "lastLogin": "2024-01-01T12:00:00.000Z"
    }
  }
  ```

#### 4. User Logout
- **POST** `/api/auth/signout`
- **Headers:**
  ```
  Cookie: Authorization=Bearer jwt_token_here
  ```

### Posts Routes (Protected)

#### 5. Get All Posts
- **GET** `/api/posts/all-posts?page=1`

#### 6. Get Single Post
- **GET** `/api/posts/single-post?_id=post_id`

#### 7. Create Post
- **POST** `/api/posts/create-post`
- **Headers:**
  ```
  Cookie: Authorization=Bearer jwt_token_here
  ```
- **Body:**
  ```json
  {
    "title": "My First Post",
    "description": "This is the content of my post"
  }
  ```

#### 8. Update Post
- **PUT** `/api/posts/update-post?_id=post_id`
- **Headers:**
  ```
  Cookie: Authorization=Bearer jwt_token_here
  ```
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "description": "Updated content"
  }
  ```

#### 9. Delete Post
- **DELETE** `/api/posts/delete-post?_id=post_id`
- **Headers:**
  ```
  Cookie: Authorization=Bearer jwt_token_here
  ```

## Security Features

- **Password Requirements:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 digit

- **JWT Token:**
  - 8-hour expiration
  - Stored in HTTP-only cookies
  - Secure in production

- **Input Validation:**
  - Email format validation
  - Password strength validation
  - Name length validation

## Testing with Postman

### 1. Create a Postman Collection
Import the following requests:

#### Registration Request
```
POST http://localhost:3000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123"
}
```

#### Login Request
```
POST http://localhost:3000/api/auth/signin
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123"
}
```

#### Dashboard Request (Protected)
```
GET http://localhost:3000/api/auth/dashboard
```

### 2. Testing Flow
1. Register a new user
2. Login to get JWT token
3. Use the token to access protected routes
4. Test dashboard endpoint
5. Test posts endpoints

## Project Structure

```
auth_login/
├── controllers/
│   ├── authController.js
│   └── postsController.js
├── middlewares/
│   ├── identication.js
│   ├── validator.js
│   └── sendMail.js
├── models/
│   ├── userModel.js
│   └── postModel.js
├── routers/
│   ├── authRouter.js
│   └── postRouter.js
├── utils/
│   └── hashing.js
├── server.js
├── package.json
└── README.md

## Error Handling

The API includes comprehensive error handling for:
- Invalid input validation
- Authentication failures
- Database errors
- JWT token validation
- Missing required fields

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://...` |
| `TOKEN_SECRET` | JWT secret key | `secret_key` |
| `NODE_ENV` | Environment mode | `development` |

## License

This project is created for educational purposes as part of a web development internship task.

##Author

Created as part of Web Developer (Back-End) Internship Task 5 - JWT Authentication Implementation. 