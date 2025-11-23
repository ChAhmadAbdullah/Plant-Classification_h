const express =require('express');
const { protect } =require('../middleware/auth.js');
const { apiRateLimiter } =require('../middleware/rateLimiter.js');
const {
 uploadImage,
 uploadVoice,
 transcribeVoice,
  handleMulterError,
  upload
}= require('../controllers/upload.controller.js');


const router = express.Router();

// All upload routes require authentication
router.use(protect);
router.use(apiRateLimiter);

// Routes with file upload middleware
router.post('/image', upload.single('image'), handleMulterError, uploadImage);
router.post('/voice', upload.single('voice'), handleMulterError, uploadVoice);
router.post('/transcribe', upload.single('voice'), handleMulterError, transcribeVoice);

module.exports = router;

