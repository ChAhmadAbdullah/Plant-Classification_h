const User =require('../models/User.js');
const OTP =require('../models/OTP.js');
const { generateOTP } =require('../utils/generateOTP.js');
const { sendOTPEmail } =require('../utils/sendEmail.js');
const { validationResult } =require('express-validator');

// Request OTP
exports.requestOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check OTP request count for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOTPs = await OTP.countDocuments({
      email,
      requestDate: { $gte: today }
    });

    if (todayOTPs >= parseInt(process.env.OTP_MAX_REQUESTS_PER_DAY || '5')) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP requests reached for today. Please try again tomorrow.'
      });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(process.env.OTP_EXPIRE_MINUTES || '2'));

    // Delete old OTPs for this email
    await OTP.deleteMany({ email });

    // Save new OTP
    const otp = new OTP({
      email,
      code: otpCode,
      expiresAt,
      requestCount: todayOTPs + 1,
      requestDate: new Date()
    });
    await otp.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otpCode);
    
    // If email sending failed but we're in dev mode, return OTP in response
    if (emailResult.devMode) {
      return res.status(200).json({
        success: true,
        message: 'OTP generated successfully (Email not configured - Development Mode)',
        otp: emailResult.otp, // Return OTP in development mode
        devMode: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email successfully'
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while requesting OTP'
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Find OTP
    const otpRecord = await OTP.findOne({ email, verified: false })
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email. Please request a new OTP.'
      });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP'
    });
  }
};

// Register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, language } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify OTP was verified
    const verifiedOTP = await OTP.findOne({ 
      email, 
      verified: true 
    }).sort({ createdAt: -1 });

    if (!verifiedOTP) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email with OTP first'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      language: language || 'urdu',
      isVerified: true
    });

    // Delete used OTP
    await OTP.deleteMany({ email });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering user'
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging in'
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, language } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (language) user.language = language;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        language: user.language
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

