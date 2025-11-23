const express = require('express');
const { body } = require('express-validator');
const  {
  requestOTP,
  verifyOTP,
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/auth.controller.js');
const { protect } = require('../middleware/auth.js');
const { apiRateLimiter, otpRateLimiter } = require('../middleware/rateLimiter.js');

const router = express.Router();

// Validation middleware
const validateEmail = body('email')
  .isEmail()
  .withMessage('Please provide a valid email')
  .normalizeEmail();

const validatePassword = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters');

const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters');

const validateOTP = body('otp')
  .isLength({ min: 6, max: 6 })
  .withMessage('OTP must be 6 digits')
  .isNumeric()
  .withMessage('OTP must be numeric');

// Routes
router.post('/request-otp', 
  apiRateLimiter,
  otpRateLimiter,
  validateEmail,
  requestOTP
);

router.post('/verify-otp',
  apiRateLimiter,
  validateEmail,
  validateOTP,
  verifyOTP
);

router.post('/register',
  apiRateLimiter,
  validateName,
  validateEmail,
  validatePassword,
  register
);

router.post('/login',
  apiRateLimiter,
  validateEmail,
  validatePassword,
  login
);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports =router;

