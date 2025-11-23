const express =require('express');``
const { body } =require('express-validator');
const{
  sendMessage,
  getMessages,
  clearMessages,
  getMessageById
} = require('../controllers/chat.controller.js');
const { protect } =require('../middleware/auth.js');
const { apiRateLimiter } =require('../middleware/rateLimiter.js');

const router = express.Router();

// All chat routes require authentication
router.use(protect);
router.use(apiRateLimiter);

// Validation
const validateMessage = body('content')
  .trim()
  .notEmpty()
  .withMessage('Message content is required');

const validateType = body('type')
  .optional()
  .isIn(['text', 'image', 'voice'])
  .withMessage('Invalid message type');

// Routes
router.post('/send',
  validateMessage,
  validateType,
  sendMessage
);

router.get('/messages', getMessages);
router.get('/messages/:id', getMessageById);
router.delete('/messages', clearMessages);

module.exports = router;

