import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatDate, copyToClipboard } from "../../utils/helpers";

const MessageBubble = ({ message, onRetry }) => {
  const { t, isUrdu } = useLanguage();
  const [isCopied, setIsCopied] = useState(false);

  const isUser = message.sender === "user";
  const isFailed = message.status === "failed";

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRetry = () => {
    if (onRetry && isFailed) {
      onRetry(message.id);
    }
  };

  const renderContent = () => {
    if (message.type === "image" && isUser) {
      return (
        <div className="relative rounded-lg overflow-hidden mb-2">
          <img src={message.content} alt="Uploaded crop" className="max-w-full sm:max-w-xs rounded-lg" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white">
            <i className="bi bi-image"></i>
            <span className="text-xs sm:text-sm">{t("image")}</span>
          </div>
        </div>
      );
    }

    if (message.type === "voice" && isUser) {
      return (
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-100 rounded-lg">
          <i className="bi bi-mic text-primary-600 text-sm sm:text-base"></i>
          <span className="text-primary-700 text-sm sm:text-base">{t("voiceMessage")}</span>
        </div>
      );
    }

    return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
  };

  const renderAnalysis = () => {
    if (!message.analysis || isUser) return null;

    return (
      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-3 font-semibold text-gray-900">
          <i className="bi bi-graph-up text-primary-500 text-sm sm:text-base"></i>
          <span className="text-sm sm:text-base">{t("analysisResults")}</span>
        </div>
        {message.analysis.detected_issues && (
          <div className="mb-3">
            <strong className="text-xs sm:text-sm text-gray-900">{t("detectedIssues")}:</strong>
            <ul className="mt-2 space-y-2">
              {message.analysis.detected_issues.map((issue, index) => (
                <li key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 p-2 bg-white rounded border border-gray-200">
                  <span className="text-xs sm:text-sm text-gray-900">{typeof issue === 'string' ? issue : issue.disease}</span>
                  {issue.confidence && (
                    <span className="text-xs sm:text-sm font-semibold text-primary-600">
                      {(issue.confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {message.analysis.recommendations && (
          <div>
            <strong className="text-xs sm:text-sm text-gray-900">{t("recommendations")}:</strong>
            <ul className="mt-2 space-y-1">
              {message.analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                  <i className="bi bi-check-circle text-green-500 mt-0.5 flex-shrink-0"></i>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUrdu ? (isUser ? "flex-row-reverse" : "") : (isUser ? "flex-row-reverse" : "")} ${isFailed ? "opacity-75" : ""}`}>
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        {isUser ? (
          <i className="bi bi-person-circle text-xl sm:text-2xl text-gray-600"></i>
        ) : (
          <i className="bi bi-robot text-xl sm:text-2xl text-primary-500"></i>
        )}
      </div>

      <div className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`flex items-center gap-1 sm:gap-2 mb-1 ${isUrdu ? "flex-row-reverse" : ""}`}>
          <span className="text-xs sm:text-sm font-semibold text-gray-900">
            {isUser ? t("you") : t("agriGPT")}
          </span>
          <span className="text-xs text-gray-500">
            {formatDate(message.timestamp, isUrdu ? "urdu" : "english")}
          </span>
        </div>

        <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-md ${
          isUser 
            ? "bg-primary-500 text-white rounded-tr-sm" 
            : "bg-gray-100 text-gray-900 rounded-tl-sm"
        } ${isFailed ? "border-2 border-red-500" : ""}`}>
          {renderContent()}
          {renderAnalysis()}
        </div>

        {isFailed ? (
          <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <button onClick={handleRetry} className="btn btn-sm bg-red-500 hover:bg-red-600 text-white text-xs">
              <i className="bi bi-arrow-clockwise"></i>
              {t("tryAgain")}
            </button>
            <span className="text-xs text-red-600">{message.error}</span>
          </div>
        ) : (
          <div className="mt-2">
            {!isUser && message.type === "text" && (
              <button
                onClick={handleCopy}
                className={`text-xs px-2 py-1 rounded text-gray-600 hover:bg-gray-100 transition-colors ${
                  isCopied ? "text-green-600" : ""
                }`}
                title={t("copyToClipboard")}
              >
                <i className={`bi ${isCopied ? "bi-check" : "bi-clipboard"} mr-1`}></i>
                {isCopied ? t("copied") : t("copy")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
