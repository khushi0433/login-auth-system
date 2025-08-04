# 🔐 User Authentication API with JWT

A secure and simple user authentication API using **Node.js**, **Express**, **MongoDB**, **Mongoose**, and **JWT**. This RESTful API supports **user registration**, **login**, and **protected routes** with token verification.

---

## Features

- User Signup (`POST /api/auth/signup`)
- User Signin/Login (`POST /api/auth/signin`)
- JWT Token Generation & Verification
- Password Hashing with bcrypt
- MongoDB Integration via Mongoose
- Protected Routes (middleware-based)

---

## Project Structure

auth_login/
├── config/
│ └── db.js
├── controllers/
│ ├── authController.js
│ └── verifyToken.js
├── models/
│ └── User.js
├── routers/
│ └── authRouter.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md

```env
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
PORT=3000

Getting Started
1. Clone the Repository

git clone https://github.com/khushi0433/User-auth-api.git
cd User-auth-api
2. Install Dependencies

npm install


cp .env.example .env
4. Start the Server
npm start
Server will run on http://localhost:8080 by default.

API Endpoints
Register User
POST /api/auth/signup

Body:

json
Copy
Edit
{
  "username": "khushi",
  "email": "khushi@example.com",
  "password": "123456"
}
Login User
POST /api/auth/signin

body:
{
  "email": "khushi@example.com",
  "password": "123456"
}
Returns:

{
  "token": "JWT_TOKEN"
}
 
Protected Route
Add middleware like verifyToken.js to protect routes using JWT.

Tech Stack
Backend: Node.js, Express

Database: MongoDB Atlas, Mongoose

Security: bcrypt, JWT

Environment: dotenv

Author
Created by Khushbu hassan
Task 5 – Web Developer (Back-End) Internship

License
This project is open-source and available under the MIT License.