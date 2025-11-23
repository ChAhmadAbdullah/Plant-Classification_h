const { HfInference } = require('@huggingface/inference');
const { InferenceClient } = require('@huggingface/inference');
const fs = require('fs');
require('dotenv').config();

// Initialize Hugging Face clients
let hf = null;
let inferenceClient = null;

// Try HF_TOKEN first (for InferenceClient), then HUGGINGFACE_API_KEY (for HfInference)
const hfToken = process.env.HF_TOKEN;

console.log("hf token is at ai service is at", process.env.HF_TOKEN);

// Add this function to test client initialization
const initializeClients = async () => {
  if (hfToken) {
    try {
      // Initialize InferenceClient for speech-to-text (preferred)
      console.log('🚀 [AI SERVICE] Creating InferenceClient...');
      inferenceClient = new InferenceClient(hfToken);
      console.log('✅ [AI SERVICE] Hugging Face InferenceClient initialized');
      console.log('   - Client type:', inferenceClient.constructor.name);
      
      // Initialize HfInference for other operations (backward compatibility)
      console.log('🚀 [AI SERVICE] Creating HfInference...');
      hf = new HfInference(hfToken);
      console.log('✅ [AI SERVICE] Hugging Face HfInference initialized');
      console.log('   - Client type:', hf.constructor.name);

      // Test the clients are working
      console.log('🧪 [AI SERVICE] Testing client functionality...');
      console.log('   - InferenceClient methods:', Object.keys(inferenceClient).filter(key => typeof inferenceClient[key] === 'function'));
      console.log('   - HfInference methods:', Object.keys(hf).filter(key => typeof hf[key] === 'function'));
      
    } catch (error) {
      console.error('❌ [AI SERVICE] Failed to initialize Hugging Face clients');
      console.error('   Error type:', error.constructor?.name);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
  } else {
    console.warn('⚠️  [AI SERVICE] No Hugging Face token found. AI features will use fallback responses.');
  }
};

// Initialize clients when module loads
initializeClients();

// Add a function to get client status
exports.getClientStatus = () => {
  return {
    inferenceClient: !!inferenceClient,
    hf: !!hf,
    hfToken: !!hfToken,
    tokenPreview: hfToken ? hfToken.substring(0, 10) + '...' : 'No token',
    envLoaded: !!process.env.HF_TOKEN
  };
};

// Models configuration
const MODELS = {
  TEXT: 'microsoft/DialoGPT-medium',
  IMAGE: 'google/vit-base-patch16-224',
  AUDIO: 'openai/whisper-large-v3'
};

/**
 * Convert Buffer to Blob for better compatibility
 */
const bufferToBlob = (buffer, mimeType = 'audio/webm') => {
  // In Node.js, we can create a Blob-like object
  return {
    arrayBuffer: () => Promise.resolve(buffer.buffer || buffer),
    size: buffer.length,
    type: mimeType,
    stream: () => {
      const { Readable } = require('stream');
      return Readable.from([buffer]);
    }
  };
};

/**
 * Get available providers that support speech recognition
 */
const getSpeechRecognitionProviders = () => {
  return [
    'fal-ai',           // Usually supports speech recognition
    'hf-inference',     // Hugging Face's own inference API
    'together',         // Together AI
    'replicate',        // Replicate
    'azure',            // Azure AI
    'aws'               // AWS Bedrock
  ];
};

/**
 * Try direct API call as last resort
 */
const tryDirectAPICall = async (audioBuffer, language) => {
  try {
    console.log('🌐 [TRANSCRIBE] Attempting direct API call to Hugging Face...');
    
    // This is a simplified direct API call approach
    // You might need to adjust based on Hugging Face's actual API
    const fetch = require('node-fetch');
    
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODELS.AUDIO}`,
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/octet-stream',
        },
        method: 'POST',
        body: audioBuffer,
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ [TRANSCRIBE] Direct API call successful');
      return result.text || '';
    } else {
      throw new Error(`API call failed: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ [TRANSCRIBE] Direct API call failed:', error.message);
    return null;
  }
};

/**
 * Transcribe audio only (for chat - returns text only, no AI processing)
 */
exports.transcribeAudioOnly = async (audioBuffer, language = 'urdu') => {
  console.log('🎤 [TRANSCRIBE] Starting audio transcription...');
  console.log('📊 [TRANSCRIBE] Audio buffer size:', audioBuffer?.length || 0, 'bytes');
  console.log('🌐 [TRANSCRIBE] Language:', language);
  console.log('🔍 [TRANSCRIBE] Available clients:');
  console.log('   - InferenceClient:', !!inferenceClient);
  console.log('   - HfInference:', !!hf);
  
  try {
    if (!inferenceClient && !hf) {
      console.warn('⚠️  [TRANSCRIBE] No transcription clients available - using fallback');
      const fallback = getFallbackResponse('voice', 'voice', language);
      return fallback.transcription || 'Transcription service unavailable';
    }

    // Try different providers that support speech recognition
    const providers = getSpeechRecognitionProviders();
    console.log('🔄 [TRANSCRIBE] Available providers for speech recognition:', providers);

    // Try InferenceClient first with different providers
    if (inferenceClient) {
      for (const provider of providers) {
        console.log(`🚀 [TRANSCRIBE] Trying InferenceClient with provider: ${provider}`);
        
        try {
          console.log('⏳ [TRANSCRIBE] Sending request to HuggingFace API...');
          
          // Convert buffer to appropriate format
          const audioData = bufferToBlob(audioBuffer, 'audio/webm');
          
          const output = await inferenceClient.automaticSpeechRecognition({
            data: audioData,
            model: MODELS.AUDIO,
            provider: provider,
          });
          
          console.log(`✅ [TRANSCRIBE] Received response from ${provider}`);
          console.log('📥 [TRANSCRIBE] Output type:', typeof output);
          
          // Extract transcription text from output
          let transcription = '';
          
          if (typeof output === 'string') {
            console.log('   ✓ Output is string type');
            transcription = output;
          } else if (output && typeof output === 'object') {
            console.log('   ✓ Output is object type');
            console.log('   - Available keys:', Object.keys(output));
            
            // Try different possible response formats
            transcription = output.text || output.transcription || output.result || '';
            
            // If text is nested, handle it
            if (typeof transcription !== 'string' && transcription?.text) {
              console.log('   - Text is nested, extracting nested text');
              transcription = transcription.text;
            }
          } else {
            console.log('   ⚠️  Output is unexpected type, converting to string');
            transcription = String(output || '');
          }
          
          console.log('📝 [TRANSCRIBE] Final transcription:', transcription);
          console.log('📏 [TRANSCRIBE] Transcription length:', transcription?.length || 0);
          
          if (transcription && transcription.trim() && transcription !== 'Unable to transcribe audio.') {
            console.log(`✅ [TRANSCRIBE] Transcription completed successfully using ${provider}`);
            return transcription.trim();
          } else {
            console.warn(`⚠️  [TRANSCRIBE] Empty transcription from ${provider}, trying next provider`);
            continue;
          }
        } catch (providerError) {
          console.error(`❌ [TRANSCRIBE] Provider ${provider} failed:`, providerError.message);
          // Continue to next provider
          continue;
        }
      }
    }

    // If all providers failed with InferenceClient, try HfInference
    if (hf) {
      console.log('🔄 [TRANSCRIBE] All InferenceClient providers failed, trying HfInference...');
      
      try {
        // Try HfInference without specifying provider (let it auto-select)
        console.log('📦 [TRANSCRIBE] Trying HfInference with auto provider selection...');
        
        const response = await hf.automaticSpeechRecognition({
          model: MODELS.AUDIO,
          data: audioBuffer
        });
        
        console.log('✅ [TRANSCRIBE] HfInference successful');
        console.log('📥 [TRANSCRIBE] HfInference response:', response);
        
        if (response && response.text) {
          console.log('📝 [TRANSCRIBE] Transcription:', response.text);
          return response.text;
        } else {
          console.warn('⚠️  [TRANSCRIBE] Empty response from HfInference');
        }
      } catch (hfError) {
        console.error('❌ [TRANSCRIBE] HfInference failed:', hfError.message);
      }
      
      // Try alternative models with HfInference
      const alternativeModels = [
        'facebook/wav2vec2-large-960h-lv60-self',
        'facebook/wav2vec2-base-960h',
        'jonatasgrosman/wav2vec2-large-xlsr-53-english',
        'NbAiLab/nb-wav2vec2-1b-bokmaal'
      ];
      
      for (const model of alternativeModels) {
        console.log(`🔄 [TRANSCRIBE] Trying alternative model: ${model}`);
        
        try {
          const altResponse = await hf.automaticSpeechRecognition({
            model: model,
            data: audioBuffer
          });
          
          if (altResponse && altResponse.text) {
            console.log(`✅ [TRANSCRIBE] Alternative model ${model} successful`);
            console.log('📝 [TRANSCRIBE] Transcription:', altResponse.text);
            return altResponse.text;
          }
        } catch (altError) {
          console.error(`❌ [TRANSCRIBE] Alternative model ${model} failed:`, altError.message);
          continue;
        }
      }
    }

    // If everything failed, try direct API call as last resort
    console.log('🔄 [TRANSCRIBE] All providers failed, trying direct API call...');
    try {
      const directResult = await tryDirectAPICall(audioBuffer, language);
      if (directResult) {
        return directResult;
      }
    } catch (directError) {
      console.error('❌ [TRANSCRIBE] Direct API call failed:', directError.message);
    }

    console.error('❌ [TRANSCRIBE] All transcription attempts failed');
    throw new Error('All transcription providers failed');

  } catch (error) {
    console.error('❌ [TRANSCRIBE] Audio transcription error occurred');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    
    // Return fallback on error
    const fallback = getFallbackResponse('voice', 'voice', language);
    console.log('📝 [TRANSCRIBE] Returning fallback response:', fallback.transcription);
    return fallback.transcription || 'Error transcribing audio';
  }
};

/**
 * Process text query and generate agricultural advice
 */
exports.processTextQuery = async (query, language = 'urdu') => {
  console.log('🤖 [TEXT PROCESS] Starting text query processing...');
  console.log('📝 [TEXT PROCESS] Query:', query);
  console.log('🌐 [TEXT PROCESS] Language:', language);
  
  try {
    if (!hf) {
      console.warn('⚠️  [TEXT PROCESS] HfInference client not available - using fallback');
      return getFallbackResponse(query, 'text', language);
    }

    const prompt = language === 'urdu' 
      ? `آپ ایک زرعی ماہر ہیں۔ اس سوال کا تفصیلی جواب دیں: ${query}`
      : `You are an agricultural expert. Provide detailed advice for: ${query}`;

    console.log('🚀 [TEXT PROCESS] Sending request to HuggingFace API...');
    const response = await hf.textGeneration({
      model: MODELS.TEXT,
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        return_full_text: false
      }
    });

    console.log('✅ [TEXT PROCESS] Received response from API');
    console.log('📥 [TEXT PROCESS] Response:', response);

    const advice = response.generated_text?.trim() || getFallbackResponse(query, 'text', language).advice;
    const analysis = extractAnalysis(advice, language);

    console.log('✅ [TEXT PROCESS] Text processing completed successfully');
    console.log('📝 [TEXT PROCESS] Advice length:', advice.length);

    return {
      success: true,
      advice,
      analysis
    };
  } catch (error) {
    console.error('❌ [TEXT PROCESS] Text processing error:');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    return getFallbackResponse(query, 'text', language);
  }
};

/**
 * Process image for crop disease detection
 */
exports.processImage = async (imagePath, language = 'urdu') => {
  console.log('🖼️  [IMAGE PROCESS] Starting image processing...');
  console.log('📁 [IMAGE PROCESS] Image path:', imagePath);
  console.log('🌐 [IMAGE PROCESS] Language:', language);
  
  try {
    if (!hf) {
      console.warn('⚠️  [IMAGE PROCESS] HfInference client not available - using fallback');
      return getFallbackResponse('image', 'image', language);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    console.log('✅ [IMAGE PROCESS] Image file read successfully');
    console.log('📊 [IMAGE PROCESS] Image buffer size:', imageBuffer.length, 'bytes');
    
    return await exports.processImageBuffer(imageBuffer, language);
  } catch (error) {
    console.error('❌ [IMAGE PROCESS] Image processing error:');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    return getFallbackResponse('image', 'image', language);
  }
};

/**
 * Process audio using Whisper for transcription
 */
exports.processAudio = async (audioPath, language = 'urdu') => {
  console.log('🎙️  [AUDIO PROCESS] Starting audio processing...');
  console.log('📁 [AUDIO PROCESS] Audio path:', audioPath);
  console.log('🌐 [AUDIO PROCESS] Language:', language);
  
  try {
    const audioBuffer = fs.readFileSync(audioPath);
    console.log('✅ [AUDIO PROCESS] Audio file read successfully');
    console.log('📊 [AUDIO PROCESS] Audio buffer size:', audioBuffer.length, 'bytes');
    
    return await exports.processAudioBuffer(audioBuffer, language);
  } catch (error) {
    console.error('❌ [AUDIO PROCESS] Audio processing error:');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    throw new Error('Failed to process audio');
  }
};

/**
 * Process audio from buffer (for direct upload)
 */
exports.processAudioBuffer = async (audioBuffer, language = 'urdu') => {
  console.log('🎙️  [PROCESS AUDIO] Starting audio buffer processing...');
  console.log('📊 [PROCESS AUDIO] Audio buffer size:', audioBuffer?.length || 0, 'bytes');
  console.log('🌐 [PROCESS AUDIO] Language:', language);
  
  try {
    if (!inferenceClient && !hf) {
      console.warn('⚠️  [PROCESS AUDIO] No transcription clients available - using fallback');
      return getFallbackResponse('voice', 'voice', language);
    }

    let transcription = 'Unable to transcribe audio.';

    if (inferenceClient || hf) {
      try {
        console.log('🚀 [PROCESS AUDIO] Using transcription service...');
        transcription = await exports.transcribeAudioOnly(audioBuffer, language);
        console.log('✅ [PROCESS AUDIO] Transcription completed');
        console.log('📝 [PROCESS AUDIO] Transcription:', transcription);
      } catch (transcribeError) {
        console.error('❌ [PROCESS AUDIO] Transcription failed:');
        console.error('   Error type:', transcribeError.constructor?.name);
        console.error('   Error message:', transcribeError.message);
      }
    }
    
    console.log('🤖 [PROCESS AUDIO] Processing transcribed text with AI...');
    const textResult = await exports.processTextQuery(transcription, language);

    console.log('✅ [PROCESS AUDIO] AI processing completed');
    console.log('📝 [PROCESS AUDIO] Advice length:', textResult.advice?.length || 0);

    return {
      success: true,
      transcription,
      advice: textResult.advice,
      analysis: textResult.analysis
    };
  } catch (error) {
    console.error('❌ [PROCESS AUDIO] Audio processing error:');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    return getFallbackResponse('voice', 'voice', language);
  }
};

/**
 * Process image from buffer (for direct upload)
 */
exports.processImageBuffer = async (imageBuffer, language = 'urdu') => {
  console.log('🖼️  [IMAGE BUFFER] Starting image buffer processing...');
  console.log('📊 [IMAGE BUFFER] Image buffer size:', imageBuffer?.length || 0, 'bytes');
  console.log('🌐 [IMAGE BUFFER] Language:', language);
  
  try {
    if (!hf) {
      console.warn('⚠️  [IMAGE BUFFER] HfInference client not available - using fallback');
      return getFallbackResponse('image', 'image', language);
    }

    console.log('🚀 [IMAGE BUFFER] Sending image classification request...');
    const response = await hf.imageClassification({
      model: MODELS.IMAGE,
      data: imageBuffer
    });

    console.log('✅ [IMAGE BUFFER] Received classification response');
    console.log('📥 [IMAGE BUFFER] Response:', response);

    const topResult = response[0];
    const detectedDisease = topResult.label;
    const confidence = topResult.score;

    console.log('🔍 [IMAGE BUFFER] Detection results:');
    console.log('   - Disease:', detectedDisease);
    console.log('   - Confidence:', confidence);

    const advice = generateImageAdvice(detectedDisease, confidence, language);
    
    const analysis = {
      detected_issues: [{
        disease: detectedDisease,
        confidence: confidence,
        symptoms: getDiseaseSymptoms(detectedDisease),
        severity: getSeverity(confidence)
      }],
      primary_issue: detectedDisease,
      confidence: confidence,
      recommendations: getRecommendations(detectedDisease, language)
    };

    console.log('✅ [IMAGE BUFFER] Image processing completed successfully');

    return {
      success: true,
      advice,
      analysis
    };
  } catch (error) {
    console.error('❌ [IMAGE BUFFER] Image processing error:');
    console.error('   Error type:', error.constructor?.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    return getFallbackResponse('image', 'image', language);
  }
};

// Helper functions
const extractAnalysis = (text, language) => {
  console.log('🔍 [ANALYSIS] Extracting analysis from text...');
  console.log('📝 [ANALYSIS] Text length:', text?.length || 0);
  
  const recommendations = [];
  const detectedIssues = [];

  const keywords = {
    urdu: {
      disease: ['بیماری', 'فنگس', 'کیڑے', 'انفیکشن'],
      treatment: ['علاج', 'دوا', 'سپرے', 'کھاد']
    },
    english: {
      disease: ['disease', 'fungus', 'pest', 'infection'],
      treatment: ['treatment', 'fungicide', 'spray', 'fertilizer']
    }
  };

  const langKeywords = keywords[language] || keywords.english;
  
  const sentences = text.split(/[.!?]/);
  sentences.forEach(sentence => {
    if (langKeywords.treatment.some(keyword => sentence.toLowerCase().includes(keyword))) {
      recommendations.push(sentence.trim());
    }
    if (langKeywords.disease.some(keyword => sentence.toLowerCase().includes(keyword))) {
      detectedIssues.push(sentence.trim());
    }
  });

  console.log('📊 [ANALYSIS] Analysis results:');
  console.log('   - Detected issues:', detectedIssues.length);
  console.log('   - Recommendations:', recommendations.length);

  return {
    detected_issues: detectedIssues.length > 0 ? detectedIssues : ['general_inquiry'],
    recommendations: recommendations.length > 0 ? recommendations : ['Consult with agricultural expert']
  };
};

const generateImageAdvice = (disease, confidence, language) => {
  const confidencePercent = (confidence * 100).toFixed(1);
  
  if (language === 'urdu') {
    return `تصویر کے تجزیے کی بنیاد پر، آپ کی فصل میں ${disease} کی ${confidencePercent}% اعتماد کے ساتھ تشخیص ہوئی ہے۔ فوری طور پر مناسب علاج کریں۔`;
  }
  
  return `Based on image analysis, ${disease} detected in your crop with ${confidencePercent}% confidence. Please take appropriate treatment immediately.`;
};

const getDiseaseSymptoms = (disease) => {
  const symptomsMap = {
    'rust': ['Orange-brown pustules', 'Yellowing leaves'],
    'blight': ['Dark spots', 'Wilting'],
    'mildew': ['White powdery coating', 'Leaf curling']
  };
  
  return symptomsMap[disease.toLowerCase()] || ['Visible crop damage'];
};

const getSeverity = (confidence) => {
  if (confidence > 0.8) return 'high';
  if (confidence > 0.5) return 'moderate';
  return 'low';
};

const getRecommendations = (disease, language) => {
  const recommendations = {
    urdu: {
      'rust': [
        'پروپیکونازول پر مشتمل فنگی سائیڈ استعمال کریں',
        'متاثرہ پتے فوری طور پر ہٹا دیں',
        'ہوا کی گردش بہتر بنائیں'
      ],
      'blight': [
        'بیکٹیریا مخالف سپرے استعمال کریں',
        'پانی کے چھینٹے سے بچیں',
        'مناسب فاصلہ رکھیں'
      ],
      'default': [
        'مقامی زرعی ماہر سے مشورہ کریں',
        'متوازن کھاد استعمال کریں',
        'کھیت کی صفائی برقرار رکھیں'
      ]
    },
    english: {
      'rust': [
        'Apply fungicide containing propiconazole',
        'Remove infected leaves immediately',
        'Improve air circulation'
      ],
      'blight': [
        'Use antibacterial spray',
        'Avoid overhead watering',
        'Maintain proper spacing'
      ],
      'default': [
        'Consult with local agricultural expert',
        'Apply balanced fertilizer',
        'Maintain field hygiene'
      ]
    }
  };

  const langRecs = recommendations[language] || recommendations.english;
  const diseaseKey = disease.toLowerCase();
  
  return langRecs[diseaseKey] || langRecs.default;
};

// Fallback response when AI service is not available
const getFallbackResponse = (query, type, language) => {
  console.log('🔄 [FALLBACK] Using fallback response for:', type, 'in', language);
  
  const fallbacks = {
    urdu: {
      text: {
        advice: 'آپ کے سوال کا جواب تیار کر رہا ہوں۔ براہ کرم تھوڑا انتظار کریں۔',
        analysis: {
          detected_issues: ['general_inquiry'],
          recommendations: ['مزید تفصیلات فراہم کریں']
        }
      },
      image: {
        advice: 'تصویر کا تجزیہ جاری ہے۔',
        analysis: {
          detected_issues: [{ disease: 'analyzing', confidence: 0.7 }],
          recommendations: ['تصویر کا تجزیہ مکمل ہونے کا انتظار کریں']
        }
      },
      voice: {
        transcription: 'آڈیو ٹرانسکرپشن جاری ہے',
        advice: 'آپ کے وائس نوٹ کا تجزیہ کیا جا رہا ہے۔',
        analysis: {
          detected_issues: ['processing'],
          recommendations: []
        }
      }
    },
    english: {
      text: {
        advice: 'I am processing your question. Please wait a moment.',
        analysis: {
          detected_issues: ['general_inquiry'],
          recommendations: ['Please provide more details']
        }
      },
      image: {
        advice: 'Image analysis in progress.',
        analysis: {
          detected_issues: [{ disease: 'analyzing', confidence: 0.7 }],
          recommendations: ['Please wait for analysis to complete']
        }
      },
      voice: {
        transcription: 'Audio transcription in progress',
        advice: 'Your voice note is being analyzed.',
        analysis: {
          detected_issues: ['processing'],
          recommendations: []
        }
      }
    }
  };

  const langFallback = fallbacks[language] || fallbacks.english;
  return {
    success: true,
    ...langFallback[type]
  };
};