const { processImageBuffer, processAudioBuffer, transcribeAudioOnly } = require('../services/aiService.js');
const ChatMessage = require('../models/ChatMessage.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    console.log('📁 [MULTER] Setting upload destination:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      console.log('📁 [MULTER] Creating upload directory:', uploadDir);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📁 [MULTER] Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    console.log('📁 [MULTER] File filter processing file:');
    console.log('   - Fieldname:', file.fieldname);
    console.log('   - Originalname:', file.originalname);
    console.log('   - Mimetype:', file.mimetype);
    console.log('   - Size:', file.size, 'bytes');
    
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        console.log('✅ [MULTER] Image file accepted');
        cb(null, true);
      } else {
        console.error('❌ [MULTER] Image file rejected - invalid mimetype:', file.mimetype);
        cb(new Error('Only image files are allowed'), false);
      }
    } else if (file.fieldname === 'voice') {
      const allowedMimeTypes = [
        'audio/webm',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/x-m4a',
        'audio/mp4',
        'audio/aac',
        'audio/flac'
      ];
      
      const isAudio = file.mimetype.startsWith('audio/') || 
                     allowedMimeTypes.includes(file.mimetype) ||
                     file.mimetype === 'audio/webm';
      
      if (isAudio) {
        console.log('✅ [MULTER] Audio file accepted');
        cb(null, true);
      } else {
        console.error('❌ [MULTER] Audio file rejected - invalid mimetype:', file.mimetype);
        console.error('   Allowed types:', allowedMimeTypes.join(', '));
        cb(new Error(`Only audio files are allowed. Received: ${file.mimetype}`), false);
      }
    } else {
      console.log('⚠️  [MULTER] Unknown fieldname, accepting file');
      cb(null, true);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.error('❌ [MULTER ERROR] Upload error occurred');
  console.error('   Error type:', err.constructor?.name);
  console.error('   Error message:', err.message);
  console.error('   Error code:', err.code);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.error('   Issue: File too large');
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${parseInt(process.env.MAX_FILE_SIZE || '10485760') / 1024 / 1024}MB`
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      console.error('   Issue: Too many files');
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    } else {
      console.error('   Issue: Multer error');
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }
  } else if (err) {
    // File filter error or other errors
    console.error('   Issue: File filter or other error');
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};

// Upload Image
const uploadImage = async (req, res) => {
  console.log('🖼️  [CONTROLLER] Upload image request received');
  console.log('📋 [CONTROLLER] Request body:', { 
    language: req.body.language,
    hasFile: !!req.file 
  });
  
  try {
    const { language = 'urdu' } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      console.error('❌ [CONTROLLER] No image file provided');
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📁 [CONTROLLER] Image file details:');
    console.log('   - Filename:', req.file.filename);
    console.log('   - Path:', req.file.path);
    console.log('   - Size:', req.file.size, 'bytes');
    console.log('   - Mimetype:', req.file.mimetype);

    console.log('📖 [CONTROLLER] Reading image file from:', req.file.path);
    const imageBuffer = fs.readFileSync(req.file.path);
    console.log('✅ [CONTROLLER] Image file read successfully');
    console.log('📊 [CONTROLLER] Image buffer size:', imageBuffer.length, 'bytes');

    console.log('🤖 [CONTROLLER] Processing image with AI...');
    const aiResponse = await processImageBuffer(imageBuffer, language);
    console.log('✅ [CONTROLLER] AI processing completed');
    console.log('📝 [CONTROLLER] AI advice length:', aiResponse.advice?.length || 0);

    console.log('🧹 [CONTROLLER] Cleaning up uploaded file:', req.file.path);
    fs.unlinkSync(req.file.path);
    console.log('✅ [CONTROLLER] File cleaned up successfully');

    console.log('💾 [CONTROLLER] Saving user message to database');
    const userMessage = await ChatMessage.create({
      user: userId,
      content: 'Image uploaded',
      type: 'image',
      sender: 'user',
      language,
      status: 'sent',
      fileUrl: req.file.filename
    });
    console.log('✅ [CONTROLLER] User message saved with ID:', userMessage._id);

    console.log('💾 [CONTROLLER] Saving AI response to database');
    const aiMessage = await ChatMessage.create({
      user: userId,
      content: aiResponse.advice,
      type: 'image',
      sender: 'ai',
      language,
      status: 'delivered',
      analysis: aiResponse.analysis
    });
    console.log('✅ [CONTROLLER] AI message saved with ID:', aiMessage._id);

    console.log('📤 [CONTROLLER] Sending response to client');
    res.status(201).json({
      success: true,
      message: 'Image analyzed successfully',
      data: {
        advice: aiResponse.advice,
        analysis: aiResponse.analysis
      }
    });
    console.log('✅ [CONTROLLER] Image upload completed successfully');

  } catch (error) {
    console.error('❌ [CONTROLLER] Upload image error occurred');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      console.log('🧹 [CONTROLLER] Cleaning up file after error:', req.file.path);
      fs.unlinkSync(req.file.path);
      console.log('✅ [CONTROLLER] File cleaned up');
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing image'
    });
  }
};

// Upload Voice
const uploadVoice = async (req, res) => {
  console.log('🎙️  [CONTROLLER] Upload voice request received');
  console.log('📋 [CONTROLLER] Request body:', { 
    language: req.body.language,
    hasFile: !!req.file 
  });
  
  try {
    const { language = 'urdu' } = req.body;
    const userId = req.user._id;

    if (!req.file) {
      console.error('❌ [CONTROLLER] No audio file provided');
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    console.log('📁 [CONTROLLER] Audio file details:');
    console.log('   - Filename:', req.file.filename);
    console.log('   - Path:', req.file.path);
    console.log('   - Size:', req.file.size, 'bytes');
    console.log('   - Mimetype:', req.file.mimetype);

    console.log('📖 [CONTROLLER] Reading audio file from:', req.file.path);
    const audioBuffer = fs.readFileSync(req.file.path);
    console.log('✅ [CONTROLLER] Audio file read successfully');
    console.log('📊 [CONTROLLER] Audio buffer size:', audioBuffer.length, 'bytes');

    console.log('🤖 [CONTROLLER] Processing audio with AI...');
    const aiResponse = await processAudioBuffer(audioBuffer, language);
    console.log('✅ [CONTROLLER] AI processing completed');
    console.log('📝 [CONTROLLER] Transcription length:', aiResponse.transcription?.length || 0);
    console.log('📝 [CONTROLLER] AI advice length:', aiResponse.advice?.length || 0);

    console.log('🧹 [CONTROLLER] Cleaning up uploaded file:', req.file.path);
    fs.unlinkSync(req.file.path);
    console.log('✅ [CONTROLLER] File cleaned up successfully');

    console.log('💾 [CONTROLLER] Saving user message to database');
    const userMessage = await ChatMessage.create({
      user: userId,
      content: aiResponse.transcription,
      type: 'voice',
      sender: 'user',
      language,
      status: 'sent',
      fileUrl: req.file.filename
    });
    console.log('✅ [CONTROLLER] User message saved with ID:', userMessage._id);

    console.log('💾 [CONTROLLER] Saving AI response to database');
    const aiMessage = await ChatMessage.create({
      user: userId,
      content: aiResponse.advice,
      type: 'voice',
      sender: 'ai',
      language,
      status: 'delivered',
      analysis: aiResponse.analysis
    });
    console.log('✅ [CONTROLLER] AI message saved with ID:', aiMessage._id);

    console.log('📤 [CONTROLLER] Sending response to client');
    res.status(201).json({
      success: true,
      message: 'Voice processed successfully',
      data: {
        transcription: aiResponse.transcription,
        advice: aiResponse.advice,
        analysis: aiResponse.analysis
      }
    });
    console.log('✅ [CONTROLLER] Voice upload completed successfully');

  } catch (error) {
    console.error('❌ [CONTROLLER] Upload voice error occurred');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      console.log('🧹 [CONTROLLER] Cleaning up file after error:', req.file.path);
      fs.unlinkSync(req.file.path);
      console.log('✅ [CONTROLLER] File cleaned up');
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while processing voice'
    });
  }
};

// Transcribe Voice (for chat - only transcribes, doesn't create messages)
const transcribeVoice = async (req, res) => {
  console.log('🎙️  [CONTROLLER] Transcribe voice request received');
  console.log('📋 [CONTROLLER] Request body:', { 
    language: req.body.language,
    hasFile: !!req.file 
  });
  
  try {
    const { language = 'urdu' } = req.body;

    if (!req.file) {
      console.error('❌ [CONTROLLER] No audio file provided');
      console.error('   - Check if multer middleware processed the file');
      console.error('   - Check if fieldname matches: "voice"');
      console.error('   - Check Content-Type header (should be multipart/form-data)');
      return res.status(400).json({
        success: false,
        message: 'No audio file provided. Please ensure the file field is named "voice" and Content-Type is multipart/form-data'
      });
    }

    console.log('📁 [CONTROLLER] Audio file details:');
    console.log('   - Filename:', req.file.filename);
    console.log('   - Path:', req.file.path);
    console.log('   - Size:', req.file.size, 'bytes');
    console.log('   - Mimetype:', req.file.mimetype);

    console.log('📖 [CONTROLLER] Reading audio file from:', req.file.path);
    const audioBuffer = fs.readFileSync(req.file.path);
    console.log('✅ [CONTROLLER] Audio file read successfully');
    console.log('📊 [CONTROLLER] Audio buffer size:', audioBuffer.length, 'bytes');

    console.log('⏳ [CONTROLLER] Starting transcription...');
    const transcription = await transcribeAudioOnly(audioBuffer, language);
    console.log('✅ [CONTROLLER] Transcription completed');
    console.log('📝 [CONTROLLER] Transcription result:', transcription);
    console.log('📏 [CONTROLLER] Transcription length:', transcription?.length || 0);

    console.log('🧹 [CONTROLLER] Cleaning up uploaded file:', req.file.path);
    fs.unlinkSync(req.file.path);
    console.log('✅ [CONTROLLER] File cleaned up successfully');

    console.log('📤 [CONTROLLER] Sending response to client');
    res.status(200).json({
      success: true,
      message: 'Voice transcribed successfully',
      data: {
        transcription: transcription
      }
    });
    console.log('✅ [CONTROLLER] Transcription completed successfully');

  } catch (error) {
    console.error('❌ [CONTROLLER] Transcribe voice error occurred');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      console.log('🧹 [CONTROLLER] Cleaning up file after error:', req.file.path);
      try {
        fs.unlinkSync(req.file.path);
        console.log('✅ [CONTROLLER] File cleaned up');
      } catch (cleanupError) {
        console.error('❌ [CONTROLLER] Failed to clean up file:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while transcribing voice'
    });
  }
};

// Export everything at the bottom using module.exports
module.exports = {
  upload,
  handleMulterError,
  uploadImage,
  uploadVoice,
  transcribeVoice
};