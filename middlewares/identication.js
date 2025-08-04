const jwt = require('jsonwebtoken');

exports.identifier = (req, res, next) => {
	let token;
	if (req.headers.client === 'not-browser') {
		token = req.headers.authorization;
	} else {
		token = req.cookies['Authorization'];
	}

	if (!token) {
		return res.status(401).json({ 
			success: false, 
			message: 'Access denied. No token provided.',
			help: 'Please login to get a valid token'
		});
	}

	try {
		const userToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
		
		const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
		
		if (jwtVerified) {
			req.user = jwtVerified;
			next();
		} else {
			throw new Error('Invalid token format');
		}
	} catch (error) {
		console.error('Authentication error:', error.message);
		
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ 
				success: false, 
				message: 'Token has expired. Please login again.',
				error: 'TOKEN_EXPIRED'
			});
		} else if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ 
				success: false, 
				message: 'Invalid token. Please login again.',
				error: 'INVALID_TOKEN'
			});
		} else {
			return res.status(401).json({ 
				success: false, 
				message: 'Authentication failed. Please login again.',
				error: 'AUTH_FAILED'
			});
		}
	}
};