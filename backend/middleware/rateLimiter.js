const rateLimit = require('express-rate-limit');

// OTP request rate limiter (5 requests per day per email)
exports.otpRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 requests per day
  message: {
    success: false,
    message: 'Maximum OTP requests reached. Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  }
});

// General API rate limiter
exports.apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

