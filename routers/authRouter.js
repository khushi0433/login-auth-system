const express = require('express');
const authController = require('../controllers/authController');
const { identifier } = require('../middlewares/identication');
const router = express.Router();

router.post('/signup', authController.signup)
router.post('/signin', authController.signin)
router.post('/signout', authController.signout)
router.get('/dashboard', identifier, authController.dashboard)

module.exports = router;