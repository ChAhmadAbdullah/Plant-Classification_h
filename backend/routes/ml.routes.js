const express = require('express');
const router = express.Router();
const multer = require('multer');
const { predictDisease, getMLStatus, quickPredict } = require('../controllers/ml.controller');
const { protect } = require('../middleware/auth');

// Configure multer for memory storage (we'll pass buffer to Python)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ML Service Status
router.get('/status', getMLStatus);

// Quick prediction (no auth required - for testing)
router.post('/predict/quick', upload.single('image'), quickPredict);

// Authenticated prediction endpoint
router.post('/predict', protect, upload.single('image'), predictDisease);

module.exports = router;
