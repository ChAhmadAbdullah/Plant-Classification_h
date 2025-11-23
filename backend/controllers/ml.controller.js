const mlService = require('../services/mlService');
const ChatMessage = require('../models/ChatMessage');

/**
 * Predict plant disease from uploaded image
 */
const predictDisease = async (req, res) => {
  console.log('🌿 [ML CONTROLLER] Predict disease request received');
  
  try {
    const { threshold = 0.60, language = 'english' } = req.body;
    const userId = req.user?._id;

    if (!req.file) {
      console.error('❌ [ML CONTROLLER] No image file provided');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📁 [ML CONTROLLER] Image file details:');
    console.log('   - Filename:', req.file.filename);
    console.log('   - Size:', req.file.size, 'bytes');
    console.log('   - Mimetype:', req.file.mimetype);

    // Get prediction from ML service
    console.log('🤖 [ML CONTROLLER] Calling ML service...');
    const prediction = await mlService.predictDisease(req.file.buffer, parseFloat(threshold));
    const formattedResult = mlService.formatPrediction(prediction);
    
    console.log('✅ [ML CONTROLLER] Prediction completed');
    console.log('📋 [ML CONTROLLER] Result:', formattedResult);

    // Save to database if user is authenticated
    if (userId) {
      console.log('💾 [ML CONTROLLER] Saving prediction to database');
      
      const userMessage = await ChatMessage.create({
        user: userId,
        content: 'Plant disease detection request',
        type: 'image',
        sender: 'user',
        language,
        status: 'sent',
        fileUrl: req.file.filename
      });

      const aiMessage = await ChatMessage.create({
        user: userId,
        content: `Plant: ${formattedResult.plant}\nDisease: ${formattedResult.disease}\nConfidence: ${formattedResult.confidence}`,
        type: 'image',
        sender: 'ai',
        language,
        status: 'delivered',
        analysis: formattedResult
      });

      console.log('✅ [ML CONTROLLER] Saved to database');
    }

    // Send response
    res.status(200).json({
      success: true,
      message: 'Prediction completed successfully',
      data: {
        prediction: formattedResult,
        raw: prediction
      }
    });

  } catch (error) {
    console.error('❌ [ML CONTROLLER] Prediction error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to predict disease',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get ML service status
 */
const getMLStatus = async (req, res) => {
  console.log('📊 [ML CONTROLLER] Status check requested');
  
  try {
    const status = mlService.getStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ [ML CONTROLLER] Status check error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ML service status'
    });
  }
};

/**
 * Quick prediction endpoint (no auth required for testing)
 */
const quickPredict = async (req, res) => {
  console.log('⚡ [ML CONTROLLER] Quick predict request received');
  
  try {
    const { threshold = 0.60 } = req.body;

    if (!req.file) {
      console.error('❌ [ML CONTROLLER] No image file provided');
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Use "image" as the field name in form-data'
      });
    }

    console.log('📁 [ML CONTROLLER] Image file:', req.file.originalname, '-', req.file.size, 'bytes');

    // Get prediction
    const prediction = await mlService.predictDisease(req.file.buffer, parseFloat(threshold));
    const formattedResult = mlService.formatPrediction(prediction);
    
    console.log('✅ [ML CONTROLLER] Quick prediction completed');

    res.status(200).json({
      success: true,
      data: formattedResult
    });

  } catch (error) {
    console.error('❌ [ML CONTROLLER] Quick predict error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to predict disease',
      hint: 'Ensure Python is installed and torch/torchvision packages are available'
    });
  }
};

module.exports = {
  predictDisease,
  getMLStatus,
  quickPredict
};
