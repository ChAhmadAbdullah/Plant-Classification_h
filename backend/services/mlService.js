const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class MLService {
  constructor() {
    this.modelPath = path.join(__dirname, '..', 'ml_model');
    this.pythonScript = path.join(this.modelPath, 'predict_service.py');
    this.isModelReady = false;
    this.initializationError = null;
    
    // Check if model files exist
    this.checkModelFiles();
  }

  checkModelFiles() {
    const requiredFiles = [
      path.join(this.modelPath, 'model.py'),
      path.join(this.modelPath, 'plant_disease_resnet50.pth'),
      path.join(this.modelPath, 'class_labels.txt')
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      this.initializationError = `Missing ML model files: ${missingFiles.join(', ')}`;
      console.error('❌ [ML SERVICE]', this.initializationError);
      console.error('💡 Please ensure the model file (plant_disease_resnet50.pth) is copied to backend/ml_model/');
      return false;
    }

    this.isModelReady = true;
    console.log('✅ [ML SERVICE] Model files found and ready');
    return true;
  }

  /**
   * Predict plant disease from image buffer
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {number} threshold - Confidence threshold (0-1)
   * @returns {Promise<Object>} Prediction results
   */
  async predictDisease(imageBuffer, threshold = 0.60) {
    return new Promise((resolve, reject) => {
      if (!this.isModelReady) {
        return reject(new Error(this.initializationError || 'ML model not ready'));
      }

      console.log('🤖 [ML SERVICE] Starting prediction...');
      console.log('📊 [ML SERVICE] Image buffer size:', imageBuffer.length, 'bytes');
      console.log('🎯 [ML SERVICE] Confidence threshold:', threshold);

      // Create a temporary file for the image
      const tempImagePath = path.join(this.modelPath, `temp_${Date.now()}.jpg`);
      
      try {
        // Write buffer to temporary file
        fs.writeFileSync(tempImagePath, imageBuffer);
        console.log('📁 [ML SERVICE] Temporary image saved:', tempImagePath);

        // Spawn Python process
        const pythonProcess = spawn('python', [
          '-c',
          `
import sys
sys.path.append('${this.modelPath.replace(/\\/g, '\\\\')}')
from model import predict_from_bytes
import json

with open('${tempImagePath.replace(/\\/g, '\\\\')}', 'rb') as f:
    image_bytes = f.read()

result = predict_from_bytes(image_bytes, ${threshold})
print(json.dumps(result))
          `
        ]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
          outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
          console.error('⚠️  [ML SERVICE] Python stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
          // Clean up temporary file
          try {
            if (fs.existsSync(tempImagePath)) {
              fs.unlinkSync(tempImagePath);
              console.log('🧹 [ML SERVICE] Temporary image cleaned up');
            }
          } catch (err) {
            console.error('⚠️  [ML SERVICE] Failed to clean up temp file:', err.message);
          }

          if (code !== 0) {
            console.error('❌ [ML SERVICE] Python process exited with code:', code);
            console.error('❌ [ML SERVICE] Error output:', errorData);
            return reject(new Error(`ML prediction failed: ${errorData || 'Unknown error'}`));
          }

          try {
            const result = JSON.parse(outputData.trim());
            console.log('✅ [ML SERVICE] Prediction successful');
            console.log('📋 [ML SERVICE] Result:', result);
            resolve(result);
          } catch (err) {
            console.error('❌ [ML SERVICE] Failed to parse Python output:', outputData);
            reject(new Error(`Failed to parse prediction result: ${err.message}`));
          }
        });

        pythonProcess.on('error', (err) => {
          console.error('❌ [ML SERVICE] Failed to start Python process:', err);
          
          // Clean up temporary file
          try {
            if (fs.existsSync(tempImagePath)) {
              fs.unlinkSync(tempImagePath);
            }
          } catch (cleanupErr) {
            console.error('⚠️  [ML SERVICE] Failed to clean up temp file:', cleanupErr.message);
          }
          
          reject(new Error(`Failed to start ML prediction: ${err.message}. Ensure Python is installed and in PATH.`));
        });

      } catch (err) {
        // Clean up on any error
        try {
          if (fs.existsSync(tempImagePath)) {
            fs.unlinkSync(tempImagePath);
          }
        } catch (cleanupErr) {
          console.error('⚠️  [ML SERVICE] Failed to clean up temp file:', cleanupErr.message);
        }
        
        reject(err);
      }
    });
  }

  /**
   * Format prediction result for user-friendly display
   * @param {Object} prediction - Raw prediction from ML model
   * @returns {Object} Formatted result
   */
  formatPrediction(prediction) {
    const { predicted_class, confidence, all_predictions, threshold_met } = prediction;

    // Parse disease name
    const parts = predicted_class.split('___');
    const plant = parts[0] || 'Unknown';
    const disease = parts[1] || 'Unknown';

    return {
      plant: plant.replace(/_/g, ' '),
      disease: disease.replace(/_/g, ' '),
      confidence: (confidence * 100).toFixed(2) + '%',
      confidenceScore: confidence,
      isHealthy: disease.toLowerCase() === 'healthy',
      isConfident: threshold_met,
      topPredictions: all_predictions.map(pred => ({
        plant: pred.class.split('___')[0].replace(/_/g, ' '),
        disease: pred.class.split('___')[1].replace(/_/g, ' '),
        confidence: (pred.confidence * 100).toFixed(2) + '%',
        confidenceScore: pred.confidence
      }))
    };
  }

  /**
   * Get ML service status
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      ready: this.isModelReady,
      error: this.initializationError,
      modelPath: this.modelPath
    };
  }
}

// Export singleton instance
module.exports = new MLService();
