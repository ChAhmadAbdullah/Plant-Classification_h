const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'voice'],
    default: 'text'
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  language: {
    type: String,
    enum: ['english', 'urdu'],
    default: 'urdu'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'failed'],
    default: 'sent'
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  fileUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatMessageSchema.index({ user: 1, createdAt: -1 });
chatMessageSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);

