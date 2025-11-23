import { uploadAPI } from './api';
import { validateFile, formatFileSize } from '../utils/helpers';
import { LANGUAGES } from '../utils/constants';

export class ImageService {
  static async analyzeImage(file, language = LANGUAGES.URDU) {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', language);

      const response = await uploadAPI.uploadImage(formData);
      
      if (response.data.success) {
        return {
          success: true,
          data: {
            advice: response.data.data.advice,
            analysis: response.data.data.analysis
          },
          fileInfo: {
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type
          }
        };
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to analyze image');
    }
  }

  // New method for image prediction
  static async predictImage(file) {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        prediction: data,
        fileInfo: {
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error(error.message || 'Failed to get prediction');
    }
  }

  // Combined method that handles both upload and prediction
  static async uploadAndPredict(file, options = {}) {
    const { 
      compress = true, 
      maxWidth = 800, 
      quality = 0.8,
      onProgress = null 
    } = options;

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create preview first for immediate UI feedback
      const preview = await this.createImagePreview(file);

      // Process image (compress if needed)
      const processed = await this.processImageForUpload(file, {
        compress,
        maxWidth,
        quality
      });

      // Simulate progress if callback provided
      if (onProgress) {
        onProgress(30); // Processing complete
      }

      // Get prediction
      const predictionResult = await this.predictImage(processed.file);

      // Complete progress
      if (onProgress) {
        onProgress(100);
      }

      return {
        ...predictionResult,
        preview,
        processedFile: processed.file,
        originalSize: processed.originalSize,
        processedSize: processed.processedSize,
        compressionRatio: processed.compressionRatio
      };
    } catch (error) {
      if (onProgress) {
        onProgress(0);
      }
      throw error;
    }
  }

  static createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          url: e.target.result,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type
        });
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  static compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  static async processImageForUpload(file, options = {}) {
    const { compress = true, maxWidth = 800, quality = 0.8 } = options;

    try {
      let processedFile = file;

      if (compress && file.size > 1024 * 1024) {
        const compressedBlob = await this.compressImage(file, maxWidth, quality);
        processedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: new Date().getTime()
        });
      }

      const preview = await this.createImagePreview(processedFile);
      
      return {
        file: processedFile,
        preview,
        originalSize: formatFileSize(file.size),
        processedSize: formatFileSize(processedFile.size),
        compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(1)
      };
    } catch (error) {
      throw new Error('Failed to process image: ' + error.message);
    }
  }

  static getImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  static isImageFile(file) {
    return file.type.startsWith('image/');
  }

  static supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  static isSupportedFormat(file) {
    return this.supportedFormats.includes(file.type);
  }

  // Utility method to format prediction results
  static formatPredictionResult(predictionData) {
    if (!predictionData) return null;

    return {
      predictedClass: predictionData['Predicted Class'] || predictionData.predicted_class || predictionData.class,
      confidence: predictionData.Confidence || predictionData.confidence || predictionData.probability,
      rawData: predictionData
    };
  }
}