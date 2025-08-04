const jwt = require('jsonwebtoken');
const {
	signupSchema,
	signinSchema,
	acceptCodeSchema,
	changePasswordSchema,
	acceptFPCodeSchema,
} = require('../middlewares/validator');
const User = require('../models/userModel');
const { doHash, doHashValidation, hmacProcess } = require('../utils/hashing');
const transport = require('../middlewares/sendMail');

exports.signup = async (req, res) => {
	const { name, email, password } = req.body;
	try {
		const { error, value } = signupSchema.validate({ name, email, password });

		if (error) {
			return res
				.status(400)
				.json({ 
					success: false, 
					message: 'Validation failed',
					error: error.details[0].message,
					field: error.details[0].path[0]
				});
		}
		
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return res
				.status(409)
				.json({ 
					success: false, 
					message: 'Account already exists with this email',
					suggestion: 'Try logging in instead or use a different email'
				});
		}

		const hashedPassword = await doHash(password, 12);

		const newUser = new User({
			name,
			email,
			password: hashedPassword,
		});
		const result = await newUser.save();
		result.password = undefined;
		
		res.status(201).json({
			success: true,
			message: '🎉 Account created successfully! Welcome aboard!',
			result,
			nextSteps: 'You can now login with your email and password'
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({
			success: false,
			message: 'Something went wrong during registration',
			error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
		});
	}
};

exports.signin = async (req, res) => {
	const { email, password } = req.body;
	try {
		const { error, value } = signinSchema.validate({ email, password });
		if (error) {
			return res
				.status(400)
				.json({ 
					success: false, 
					message: 'Invalid input',
					error: error.details[0].message,
					field: error.details[0].path[0]
				});
		}

		const existingUser = await User.findOne({ email }).select('+password');
		if (!existingUser) {
			return res
				.status(401)
				.json({ 
					success: false, 
					message: 'Account not found',
					suggestion: 'Please check your email or create a new account'
				});
		}
		
		const result = await doHashValidation(password, existingUser.password);
		if (!result) {
			return res
				.status(401)
				.json({ 
					success: false, 
					message: 'Incorrect password',
					suggestion: 'Please check your password and try again'
				});
		}
		
		const token = jwt.sign(
			{
				userId: existingUser._id,
				email: existingUser.email,
				verified: existingUser.verified,
			},
			process.env.TOKEN_SECRET,
			{
				expiresIn: '8h',
			}
		);

		res
			.cookie('Authorization', 'Bearer ' + token, {
				expires: new Date(Date.now() + 8 * 3600000),
				httpOnly: process.env.NODE_ENV === 'production',
				secure: process.env.NODE_ENV === 'production',
			})
			.json({
				success: true,
				token,
				message: '🎉 Welcome back! Login successful',
				user: {
					id: existingUser._id,
					name: existingUser.name,
					email: existingUser.email,
					verified: existingUser.verified
				},
				tokenExpiresIn: '8 hours'
			});
	} catch (error) {
		console.error('Signin error:', error);
		res.status(500).json({
			success: false,
			message: 'Something went wrong during login',
			error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
		});
	}
};

exports.signout = async (req, res) => {
	res
		.clearCookie('Authorization')
		.status(200)
		.json({ success: true, message: 'logged out successfully' });
};

exports.sendVerificationCode = async (req, res) => {
	const { email } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			return res
				.status(404)
				.json({ success: false, message: 'User does not exists!' });
		}
		if (existingUser.verified) {
			return res
				.status(400)
				.json({ success: false, message: 'You are already verified!' });
		}

		const codeValue = Math.floor(Math.random() * 1000000).toString();
		let info = await transport.sendMail({
			from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
			to: existingUser.email,
			subject: 'verification code',
			html: '<h1>' + codeValue + '</h1>',
		});

		if (info.accepted[0] === existingUser.email) {
			const hashedCodeValue = hmacProcess(
				codeValue,
				process.env.HMAC_VERIFICATION_CODE_SECRET
			);
			existingUser.verificationCode = hashedCodeValue;
			existingUser.verificationCodeValidation = Date.now();
			await existingUser.save();
			return res.status(200).json({ success: true, message: 'Code sent!' });
		}
		res.status(400).json({ success: false, message: 'Code sent failed!' });
	} catch (error) {
		console.log(error);
	}
};

exports.verifyVerificationCode = async (req, res) => {
	const { email, providedCode } = req.body;
	try {
		const { error, value } = acceptCodeSchema.validate({ email, providedCode });
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

		const codeValue = providedCode.toString();
		const existingUser = await User.findOne({ email }).select(
			'+verificationCode +verificationCodeValidation'
		);

		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}
		if (existingUser.verified) {
			return res
				.status(400)
				.json({ success: false, message: 'you are already verified!' });
		}

		if (
			!existingUser.verificationCode ||
			!existingUser.verificationCodeValidation
		) {
			return res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
		}

		if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
			return res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			process.env.HMAC_VERIFICATION_CODE_SECRET
		);

		if (hashedCodeValue === existingUser.verificationCode) {
			existingUser.verified = true;
			existingUser.verificationCode = undefined;
			existingUser.verificationCodeValidation = undefined;
			await existingUser.save();
			return res
				.status(200)
				.json({ success: true, message: 'your account has been verified!' });
		}
		return res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
	} catch (error) {
		console.log(error);
	}
};

exports.changePassword = async (req, res) => {
	const { userId, verified } = req.user;
	const { oldPassword, newPassword } = req.body;
	try {
		const { error, value } = changePasswordSchema.validate({
			oldPassword,
			newPassword,
		});
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}
		if (!verified) {
			return res
				.status(401)
				.json({ success: false, message: 'You are not verified user!' });
		}
		const existingUser = await User.findOne({ _id: userId }).select(
			'+password'
		);
		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}
		const result = await doHashValidation(oldPassword, existingUser.password);
		if (!result) {
			return res
				.status(401)
				.json({ success: false, message: 'Invalid credentials!' });
		}
		const hashedPassword = await doHash(newPassword, 12);
		existingUser.password = hashedPassword;
		await existingUser.save();
		return res
			.status(200)
			.json({ success: true, message: 'Password updated!!' });
	} catch (error) {
		console.log(error);
	}
};

exports.sendForgotPasswordCode = async (req, res) => {
	const { email } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			return res
				.status(404)
				.json({ success: false, message: 'User does not exists!' });
		}

		const codeValue = Math.floor(Math.random() * 1000000).toString();
		let info = await transport.sendMail({
			from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
			to: existingUser.email,
			subject: 'Forgot password code',
			html: '<h1>' + codeValue + '</h1>',
		});

		if (info.accepted[0] === existingUser.email) {
			const hashedCodeValue = hmacProcess(
				codeValue,
				process.env.HMAC_VERIFICATION_CODE_SECRET
			);
			existingUser.forgotPasswordCode = hashedCodeValue;
			existingUser.forgotPasswordCodeValidation = Date.now();
			await existingUser.save();
			return res.status(200).json({ success: true, message: 'Code sent!' });
		}
		res.status(400).json({ success: false, message: 'Code sent failed!' });
	} catch (error) {
		console.log(error);
	}
};

exports.verifyForgotPasswordCode = async (req, res) => {
	const { email, providedCode, newPassword } = req.body;
	try {
		const { error, value } = acceptFPCodeSchema.validate({
			email,
			providedCode,
			newPassword,
		});
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

		const codeValue = providedCode.toString();
		const existingUser = await User.findOne({ email }).select(
			'+forgotPasswordCode +forgotPasswordCodeValidation'
		);

		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}

		if (
			!existingUser.forgotPasswordCode ||
			!existingUser.forgotPasswordCodeValidation
		) {
			return res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
		}

		if (
			Date.now() - existingUser.forgotPasswordCodeValidation >
			5 * 60 * 1000
		) {
			return res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			process.env.HMAC_VERIFICATION_CODE_SECRET
		);

		if (hashedCodeValue === existingUser.forgotPasswordCode) {
			const hashedPassword = await doHash(newPassword, 12);
			existingUser.password = hashedPassword;
			existingUser.forgotPasswordCode = undefined;
			existingUser.forgotPasswordCodeValidation = undefined;
			await existingUser.save();
			return res
				.status(200)
				.json({ success: true, message: 'Password updated!!' });
		}
		return res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
	} catch (error) {
		console.log(error);
	}
};

exports.dashboard = async (req, res) => {
	try {
		const { userId } = req.user;
		
		const user = await User.findById(userId).select('-password -verificationCode -verificationCodeValidation -forgotPasswordCode -forgotPasswordCodeValidation');
		
		if (!user) {
			return res.status(404).json({ 
				success: false, 
				message: 'User not found' 
			});
		}

		res.status(200).json({
			success: true,
			message: 'Dashboard data retrieved successfully',
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					verified: user.verified,
					createdAt: user.createdAt
				},
				welcomeMessage: `Welcome back, ${user.name}!`,
				lastLogin: new Date().toISOString()
			}
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: 'Internal server error'
		});
	}
};