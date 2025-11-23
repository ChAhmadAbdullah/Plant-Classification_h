const ChatMessage= require('../models/ChatMessage.js');
const { validationResult } =require('express-validator');
const { processTextQuery } =require('../services/aiService.js');

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, type = 'text', language = 'urdu' } = req.body;
    const userId = req.user._id;

    // Save user message
    const userMessage = await ChatMessage.create({
      user: userId,
      content,
      type,
      sender: 'user',
      language,
      status: 'sent'
    });

    // Process with AI service
    let aiResponse;
    
    if (type === 'text') {
      aiResponse = await processTextQuery(content, language);
    } else {
      // For image and voice, they are handled in upload controller
      aiResponse = {
        success: true,
        advice: 'Processing completed',
        analysis: {}
      };
    }
    
    // Save AI response
    const aiMessage = await ChatMessage.create({
      user: userId,
      content: aiResponse.advice || 'Response received',
      type,
      sender: 'ai',
      language,
      status: 'delivered',
      analysis: aiResponse.analysis,
      metadata: {
        source: 'huggingface',
        confidence: aiResponse.analysis?.confidence || 0.85
      }
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage: {
          id: userMessage._id,
          content: userMessage.content,
          type: userMessage.type,
          timestamp: userMessage.createdAt
        },
        aiMessage: {
          id: aiMessage._id,
          content: aiMessage.content,
          type: aiMessage.type,
          analysis: aiMessage.analysis,
          timestamp: aiMessage.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
};

// Get Messages
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, limit = 50, page = 1 } = req.query;

    const query = { user: userId };
    if (type) query.type = type;

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ChatMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

// Get Message by ID
exports.getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await ChatMessage.findOne({ _id: id, user: userId });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching message'
    });
  }
};

// Clear Messages
exports.clearMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    await ChatMessage.deleteMany({ user: userId });

    res.status(200).json({
      success: true,
      message: 'Messages cleared successfully'
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing messages'
    });
  }
};
