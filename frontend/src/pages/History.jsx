import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "../components/common/LanguageSelector";
import { ChatService } from "../services/chatService";
import { formatDate } from "../utils/helpers";

const History = () => {
  const { t, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        await ChatService.loadMessages();
        setMessages(ChatService.getMessages());
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
    const unsubscribe = ChatService.subscribe((updatedMessages) => {
      setMessages(updatedMessages);
    });
    return unsubscribe;
  }, []);

  const filters = [
    { id: "all", label: "allQueries", icon: "bi-list" },
    { id: "text", label: "textQueries", icon: "bi-chat-text" },
    { id: "image", label: "imageQueries", icon: "bi-camera" },
    { id: "voice", label: "voiceQueries", icon: "bi-mic" },
  ];

  const filteredMessages = messages.filter((message) => {
    const matchesFilter = filter === "all" || message.type === filter;
    const matchesSearch =
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.analysis &&
        JSON.stringify(message.analysis)
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const clearHistory = () => {
    if (window.confirm(t("confirmClearHistory"))) {
      ChatService.clearMessages();
      setSelectedMessage(null);
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case "text":
        return "bi-chat-text";
      case "image":
        return "bi-camera";
      case "voice":
        return "bi-mic";
      default:
        return "bi-chat";
    }
  };

  const getMessageTypeColor = (type) => {
    switch (type) {
      case "text":
        return "bg-secondary-100 text-secondary-700 border-secondary-300";
      case "image":
        return "bg-primary-100 text-primary-700 border-primary-300";
      case "voice":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const stats = ChatService.getConversationStats();

  return (
    <div className={`min-h-screen bg-gray-50 py-4 sm:py-8 ${isUrdu ? "urdu-layout" : ""}`}>
      <div className="container">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">{t("queryHistory")}</h1>
              <p className="text-sm sm:text-base text-gray-600">{t("historyDescription")}</p>
            </div>
            <div className="flex-shrink-0">
              <LanguageSelector />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Statistics */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="bi bi-graph-up text-primary-500"></i>
                {t("statistics")}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                <div className="p-3 bg-primary-50 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stats.totalMessages}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">{t("totalQueries")}</div>
                </div>
                <div className="p-3 bg-secondary-50 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-secondary-600">{stats.userMessages}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">{t("yourQueries")}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.aiMessages}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">{t("aiResponses")}</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.successRate}%</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">{t("successRate")}</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="card p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="bi bi-funnel text-primary-500"></i>
                {t("filters")}
              </h3>
              <div className="space-y-2">
                {filters.map((filterItem) => (
                  <button
                    key={filterItem.id}
                    onClick={() => setFilter(filterItem.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      filter === filterItem.id
                        ? "bg-primary-500 text-white shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <i className={filterItem.icon}></i>
                      <span className="text-sm sm:text-base">{t(filterItem.label)}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      filter === filterItem.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {filterItem.id === "all"
                        ? messages.length
                        : messages.filter((m) => m.type === filterItem.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear History */}
            <button
              onClick={clearHistory}
              disabled={messages.length === 0}
              className="w-full btn btn-outline-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="bi bi-trash"></i>
              {t("clearHistory")}
            </button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Search Bar */}
            <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="bi bi-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder={t("searchHistory")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {t("showing")} {filteredMessages.length} {t("of")} {messages.length} {t("queries")}
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="card p-8 sm:p-12 text-center">
                  <i className="bi bi-clock-history text-4xl sm:text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? t("noResultsFound") : t("noHistoryYet")}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    {searchTerm ? t("tryDifferentSearch") : t("startChattingToSeeHistory")}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => navigate("/chat")}
                      className="btn btn-primary"
                    >
                      <i className="bi bi-chat"></i>
                      {t("startChat")}
                    </button>
                  )}
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`card p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedMessage?.id === message.id ? "ring-2 ring-primary-500" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`p-2 rounded-lg border ${getMessageTypeColor(message.type)}`}>
                          <i className={getMessageTypeIcon(message.type)}></i>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-gray-700">
                            {t(
                              message.type === "text"
                                ? "textQuery"
                                : message.type === "image"
                                ? "imageQuery"
                                : "voiceQuery"
                            )}
                          </span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formatDate(message.timestamp, isUrdu ? "urdu" : "english")}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : message.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {t(message.status)}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base text-gray-700">
                      {message.type === "image" ? (
                        <div className="flex items-center gap-2 text-primary-600">
                          <i className="bi bi-image"></i>
                          <span>{t("imageAnalysis")}</span>
                        </div>
                      ) : message.type === "voice" ? (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <i className="bi bi-mic"></i>
                          <span>{t("voiceMessage")}</span>
                        </div>
                      ) : (
                        <p className="line-clamp-2">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detail Panel Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMessage(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{t("queryDetails")}</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="bi bi-x text-xl"></i>
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-4 sm:space-y-6">
                  {/* Query */}
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t("query")}</h4>
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      {selectedMessage.type === "image" ? (
                        <div className="flex items-center gap-2 text-primary-600">
                          <i className="bi bi-image"></i>
                          <span>{t("imageAnalysisPerformed")}</span>
                        </div>
                      ) : selectedMessage.type === "voice" ? (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <i className="bi bi-mic"></i>
                          <span>{t("voiceMessageProcessed")}</span>
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base">{selectedMessage.content}</p>
                      )}
                    </div>
                  </div>

                  {/* Response */}
                  {selectedMessage.sender === "ai" && (
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t("response")}</h4>
                      <div className="p-3 sm:p-4 bg-primary-50 rounded-lg">
                        <p className="text-sm sm:text-base text-gray-700">{selectedMessage.content}</p>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t("metadata")}</h4>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">{t("type")}</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {t(
                            selectedMessage.type === "text"
                              ? "text"
                              : selectedMessage.type === "image"
                              ? "image"
                              : "voice"
                          )}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">{t("language")}</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {t(selectedMessage.language === "urdu" ? "urdu" : "english")}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">{t("timestamp")}</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatDate(selectedMessage.timestamp, isUrdu ? "urdu" : "english")}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">{t("status")}</div>
                        <div className={`text-sm font-semibold ${
                          selectedMessage.status === "delivered"
                            ? "text-green-600"
                            : selectedMessage.status === "failed"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}>
                          {t(selectedMessage.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis */}
                  {selectedMessage.analysis && (
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{t("analysis")}</h4>
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-lg overflow-x-auto">
                        <pre className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedMessage.analysis, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
