import React, { useState } from 'react';
import { ImageService } from '../services/imageService';

function DiseasePrediction() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setPrediction(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handlePredict = async () => {
    if (!file) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ImageService.predictDisease(file, 0.60);
      setPrediction(result.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDiseaseColor = (isHealthy) => {
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getConfidenceColor = (confidence) => {
    const score = parseFloat(confidence);
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          🌿 Plant Disease Detection
        </h2>

        {/* Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Plant Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100
              cursor-pointer"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="mb-6 flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="max-w-md max-h-96 rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Predict Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handlePredict}
            disabled={!file || loading}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all
              ${!file || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:scale-95'
              }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              '🔍 Analyze Plant'
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-center">❌ {error}</p>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                🎯 Prediction Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Plant Type</p>
                  <p className="text-2xl font-bold text-gray-800">{prediction.plant}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600 mb-1">Disease</p>
                  <p className={`text-2xl font-bold ${getDiseaseColor(prediction.isHealthy)}`}>
                    {prediction.disease}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Confidence</span>
                  <span className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      parseFloat(prediction.confidence) >= 80
                        ? 'bg-green-500'
                        : parseFloat(prediction.confidence) >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: prediction.confidence }}
                  ></div>
                </div>
              </div>

              {!prediction.isConfident && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm text-center">
                    ⚠️ Low confidence prediction. Consider taking a clearer photo.
                  </p>
                </div>
              )}
            </div>

            {/* Top Predictions */}
            {prediction.topPredictions && prediction.topPredictions.length > 1 && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-3">📊 Alternative Predictions</h4>
                <div className="space-y-2">
                  {prediction.topPredictions.slice(1, 3).map((pred, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                      <div>
                        <span className="font-semibold text-gray-700">{pred.plant}</span>
                        <span className="text-gray-500 mx-2">—</span>
                        <span className="text-gray-600">{pred.disease}</span>
                      </div>
                      <span className="text-gray-700 font-semibold">{pred.confidence}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DiseasePrediction;
