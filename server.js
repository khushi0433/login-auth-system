require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const authRouter = require('./routers/authRouter');
const postsRouter = require('./routers/postRouter');

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		console.log('Database connected successfully');
	})
	.catch((err) => {
		console.error('Database connection failed:', err.message);
		process.exit(1);
	});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.get('/', (req, res) => {
	res.json({ 
		message: 'JWT Authentication API is running!',
		endpoints: {
			auth: '/api/auth',
			posts: '/api/posts',
			docs: 'Check README.md for full documentation'
		}
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`API Documentation: http://localhost:${PORT}`);
});