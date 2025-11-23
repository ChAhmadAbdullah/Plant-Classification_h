import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import ImageUpload from "../components/upload/ImageUpload";
import VoiceUpload from "../components/upload/VoiceUpload";
import LanguageSelector from "../components/common/LanguageSelector";
import { ImageService } from "../services/imageService";
import { ChatService } from "../services/chatService";
import { uploadAPI } from "../services/api";
import { LANGUAGES } from "../utils/constants";

const Upload = () => {
  const { t, isUrdu } = useLanguage();
  const [activeTab, setActiveTab] = useState("image");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const tabs = [
    { id: "image", label: "imageAnalysis", icon: "bi-camera" },
    { id: "voice", label: "voiceNotes", icon: "bi-mic" },
  ];

  const handleImageAnalysis = async (file) => {
    setIsLoading(true);
    setResults(null);
    try {
      const language = isUrdu ? LANGUAGES.URDU : LANGUAGES.ENGLISH;
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', language);
      
      const response = await uploadAPI.uploadImage(formData);
      
      if (response.data.success) {
        const results = {
          type: "image",
          analysis: response.data.data.analysis,
          advice: response.data.data.advice,
          fileInfo: {
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
          }
        };
        setResults(results);
        await ChatService.sendMessage("Image analysis completed", "image", language);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setResults({
        type: "image",
        error: error.message || "Failed to analyze image"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceAnalysis = async (file) => {
    setIsLoading(true);
    setResults(null);
    try {
      const language = isUrdu ? LANGUAGES.URDU : LANGUAGES.ENGLISH;
      
      const formData = new FormData();
      formData.append('voice', file);
      formData.append('language', language);
      
      const response = await uploadAPI.uploadVoice(formData);
      
      if (response.data.success) {
        const results = {
          type: "voice",
          transcription: response.data.data.transcription,
          analysis: response.data.data.analysis,
          advice: response.data.data.advice
        };
        setResults(results);
        await ChatService.sendMessage(results.transcription, "voice", language);
      }
    } catch (error) {
      console.error("Voice analysis failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;
    return (
      <div className="card p-6 space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">{t("analysisResults")}</h3>
        {results.type === "voice" && results.transcription && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <i className="bi bi-transcribe text-primary-500"></i>
              {t("transcription")}
            </h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p>{results.transcription}</p>
            </div>
          </div>
        )}
        {results.analysis?.detected_issues && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="bi bi-exclamation-triangle text-red-500"></i>
              {t("detectedIssues")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.analysis.detected_issues.map((issue, index) => (
                <div key={index} className="card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{typeof issue === "string" ? issue : issue.disease}</span>
                    {issue.confidence && (
                      <span className="text-sm font-bold text-primary-600">
                        {(issue.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {issue.symptoms && (
                    <div className="text-sm text-gray-600">
                      <strong>{t("symptoms")}:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {issue.symptoms.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {results.analysis?.recommendations && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i className="bi bi-lightbulb text-yellow-500"></i>
              {t("recommendations")}
            </h4>
            <div className="space-y-2">
              {results.analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <i className="bi bi-check-circle text-green-500 mt-0.5"></i>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {results.advice && (
          <div className="p-4 bg-primary-50 rounded-lg border-l-4 border-primary-500">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <i className="bi bi-robot text-primary-500"></i>
              {t("agriculturalAdvice")}
            </h4>
            <p className="text-gray-700">{results.advice}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-8 ${isUrdu ? "urdu-layout" : ""}`}>
      <div className="container">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t("uploadAnalysis")}</h1>
              <p className="text-gray-600">{t("uploadDescription")}</p>
            </div>
            <LanguageSelector />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setResults(null);
                  }}
                  disabled={isLoading}
                  className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-primary-500 text-white border-b-2 border-primary-500"
                      : "text-gray-700 hover:bg-gray-100"
                  } disabled:opacity-50`}
                >
                  <i className={tab.icon}></i>
                  <span>{t(tab.label)}</span>
                </button>
              ))}
            </div>
            {activeTab === "image" ? (
              <ImageUpload onAnalysisComplete={handleImageAnalysis} isLoading={isLoading} disabled={isLoading} />
            ) : (
              <VoiceUpload onAnalysisComplete={handleVoiceAnalysis} isLoading={isLoading} disabled={isLoading} />
            )}
          </div>

          <div>
            {isLoading ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("analyzing")}</h3>
                <p className="text-gray-600">{t("analysisInProgress")}</p>
              </div>
            ) : (
              renderResults() || (
                <div className="card p-12 text-center">
                  <i className="bi bi-cloud-arrow-up text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("noResultsYet")}</h3>
                  <p className="text-gray-600">{t("uploadToSeeResults")}</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
