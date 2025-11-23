const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  verified: {
    type: Boolean,
    default: false
  },
  requestCount: {
    type: Number,
    default: 1
  },
  requestDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
otpSchema.index({ email: 1, requestDate: 1 });

module.exports = mongoose.model('OTP', otpSchema);

