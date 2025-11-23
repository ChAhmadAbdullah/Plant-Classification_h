import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import ChatInterface from "../components/chat/ChatInterface";
import LanguageSelector from "../components/common/LanguageSelector";

const Chat = () => {
  const { t, isUrdu } = useLanguage();
  const [activeTab, setActiveTab] = useState("chat");

  const tabs = [
    { id: "chat", label: "textChat", icon: "bi-chat-text" },
    { id: "history", label: "chatHistory", icon: "bi-clock" },
    { id: "saved", label: "savedResponses", icon: "bi-bookmark" },
  ];

  const sampleQuestions = [
    t("sampleQuestion1"),
    t("sampleQuestion2"),
    t("sampleQuestion3"),
    t("sampleQuestion4"),
    t("sampleQuestion5"),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatInterface />;
      case "history":
        return (
          <div className="flex items-center justify-center h-64 sm:h-96">
            <div className="text-center px-4">
              <i className="bi bi-clock-history text-4xl sm:text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t("noHistoryYet")}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t("historyDescription")}</p>
            </div>
          </div>
        );
      case "saved":
        return (
          <div className="flex items-center justify-center h-64 sm:h-96">
            <div className="text-center px-4">
              <i className="bi bi-bookmark text-4xl sm:text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t("noSavedResponses")}</h3>
              <p className="text-sm sm:text-base text-gray-600">{t("savedDescription")}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 py-4 sm:py-8 ${isUrdu ? "urdu-layout" : ""}`}>
      <div className="container">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{t("agriculturalChat")}</h1>
              <p className="text-sm sm:text-base text-gray-600">{t("chatDescription")}</p>
            </div>
            <div className="flex-shrink-0">
              <LanguageSelector />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-4 sm:space-y-6">
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <i className="bi bi-lightbulb text-primary-500"></i>
                {t("quickQuestions")}
              </h3>
              <div className="space-y-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-xs sm:text-sm text-gray-700 flex items-start gap-2"
                    onClick={() => console.log("Question:", question)}
                  >
                    <i className="bi bi-chat-square-question text-primary-500 mt-0.5 flex-shrink-0"></i>
                    <span className="break-words">{question}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <i className="bi bi-info-circle text-primary-500"></i>
                {t("tips")}
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {[
                  t("tipBeSpecific"),
                  t("tipUploadImages"),
                  t("tipUseVoice"),
                  t("tipCheckHistory"),
                ].map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                    <i className="bi bi-check-circle text-green-500 mt-0.5 flex-shrink-0"></i>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <i className="bi bi-graph-up text-primary-500"></i>
                {t("statistics")}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-2 sm:p-3 bg-primary-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-primary-600">24</div>
                  <div className="text-xs text-gray-600">{t("queriesToday")}</div>
                </div>
                <div className="text-center p-2 sm:p-3 bg-secondary-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-secondary-600">156</div>
                  <div className="text-xs text-gray-600">{t("queriesThisWeek")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card p-0 overflow-hidden">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-0 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                      activeTab === tab.id
                        ? "bg-primary-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <i className={tab.icon}></i>
                    <span className="truncate">{t(tab.label)}</span>
                  </button>
                ))}
              </div>
              <div className="p-3 sm:p-6 min-h-[400px] sm:min-h-[600px]">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
