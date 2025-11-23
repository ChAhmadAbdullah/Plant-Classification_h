import React, { useState, useRef } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { ImageService } from "../../services/imageService";
import { validateFile } from "../../utils/helpers";

const ImageUpload = ({ onAnalysisComplete, isLoading, disabled }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const supportedFormats = ["JPEG", "JPG", "PNG", "WEBP"];
  const maxSizeMB = 10;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleFileSelect = async (file) => {
    setError(null);
    setUploadProgress(0);
    setPrediction(null);
    setIsUploading(true);

    try {
      // Use the new service method that handles everything
      const result = await ImageService.uploadAndPredict(file, {
        onProgress: (progress) => setUploadProgress(progress)
      });

      setPreview(result.preview);
      setPrediction(result.prediction);

      if (onAnalysisComplete) {
        await onAnalysisComplete(result.processedFile, result.prediction);
      }

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || t("uploadFailed"));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  };

  const triggerFileInput = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const removePreview = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    setPrediction(null);
  };

  const getPreviewDimensions = () => {
    if (!preview?.url) return "Loading...";
    
    const img = new Image();
    img.src = preview.url;
    return `${img.width} × ${img.height}`;
  };

  // Format prediction for display
  const formatPrediction = (predictionData) => {
    const formatted = ImageService.formatPredictionResult(predictionData);
    if (!formatted) return null;

    return {
      predictedClass: formatted.predictedClass,
      confidence: formatted.confidence
    };
  };

  const displayPrediction = formatPrediction(prediction);

  return (
    <div className="card p-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary-500 bg-primary-50 scale-105"
              : "border-gray-300 hover:border-primary-400 bg-gray-50"
          } ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="bi bi-cloud-arrow-up text-3xl text-primary-500"></i>
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {isUploading ? t("uploading") : t("uploadImage")}
          </h4>
          <p className="text-gray-600 mb-4">
            {t("dragDrop")} <span className="font-semibold">{t("or")}</span> {t("browseFiles")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <i className="bi bi-check-circle text-primary-500"></i>
              {t("supportedFormats")}: {supportedFormats.join(", ")}
            </span>
            <span className="flex items-center gap-1">
              <i className="bi bi-check-circle text-primary-500"></i>
              {t("maxSize")}: {maxSizeMB}MB
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h5 className="text-lg font-bold text-gray-900">{t("imagePreview")}</h5>
            <button
              onClick={removePreview}
              disabled={isLoading || isUploading}
              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Remove preview"
            >
              <i className="bi bi-x"></i>
            </button>
          </div>

          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img 
              src={preview.url} 
              alt="Preview" 
              className="w-full h-auto max-h-64 object-contain" 
            />
            {uploadProgress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-center">
                  {uploadProgress < 100 ? t("uploading") : t("complete")} ({uploadProgress}%)
                </p>
              </div>
            )}
          </div>

          {displayPrediction && (
            <div className="mt-4 p-4 border border-green-200 rounded-lg bg-green-50 text-green-800">
              <h6 className="font-bold text-lg mb-2">Analysis Results</h6>
              <div className="space-y-2">
                <p>
                  <strong>Predicted Class:</strong> {displayPrediction.predictedClass}
                </p>
                <p>
                  <strong>Confidence:</strong> {(displayPrediction.confidence * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t("fileName")}:</span>
              <p className="font-semibold text-gray-900 truncate">{preview.name}</p>
            </div>
            <div>
              <span className="text-gray-600">{t("fileSize")}:</span>
              <p className="font-semibold text-gray-900">{preview.size}</p>
            </div>
            <div>
              <span className="text-gray-600">{t("dimensions")}:</span>
              <p className="font-semibold text-gray-900">{getPreviewDimensions()}</p>
            </div>
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <i className="bi bi-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {(isLoading || isUploading) && (
        <div className="mt-4 flex items-center justify-center gap-3 p-4 bg-primary-50 rounded-lg">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-primary-700 font-medium">
            {isUploading ? t("uploading") : t("analyzingImage")}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;