import { LANGUAGES } from './constants';

export const formatDate = (date, language = LANGUAGES.ENGLISH) => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleDateString(
    language === LANGUAGES.URDU ? 'ur-PK' : 'en-US', 
    options
  );
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
  
  const validTypes = [...validImageTypes, ...validAudioTypes];
  
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'invalidFileType' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'fileTooLarge' };
  }
  
  return { isValid: true, error: null };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'unknown';
};

export const createFormData = (file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });
  
  return formData;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const isMobile = () => {
  return window.innerWidth <= 768;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};