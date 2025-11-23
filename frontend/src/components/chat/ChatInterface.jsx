import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { ChatService } from "../../services/chatService";

const ChatInterface = () => {
  const { t, isUrdu } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load messages from API
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
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content, type = "text") => {
    if (!content.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await ChatService.sendMessage(content, type, isUrdu ? "urdu" : "english");
    } catch (err) {
      setError(err.message);
      console.error("Failed to send message:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async (messageId) => {
    const message = ChatService.getMessageById(messageId);
    if (message) {
      await handleSendMessage(message.content, message.type);
    }
  };

  const clearChat = () => {
    ChatService.clearMessages();
    setError(null);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden ${isUrdu ? "urdu-layout" : ""}`}>
      {/* Chat Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="bi bi-robot text-base sm:text-xl text-white"></i>
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{t("agriculturalAdvice")}</h3>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">{t("aiPoweredAssistant")}</p>
          </div>
        </div>
        {hasMessages && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            title={t("clearChat")}
          >
            <i className="bi bi-trash"></i>
            <span className="hidden sm:inline">{t("clear")}</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mx-3 sm:mx-4 mt-3 sm:mt-4">
          <i className="bi bi-exclamation-triangle flex-shrink-0"></i>
          <span className="flex-1 text-sm">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 flex-shrink-0">
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-hide" ref={chatContainerRef}>
        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 sm:py-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mb-4">
              <i className="bi bi-chat-square-text text-3xl sm:text-4xl text-primary-500"></i>
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t("noMessages")}</h4>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mb-4">{t("startConversation")}</p>
            <button className="btn btn-primary btn-sm sm:btn-lg">
              <i className="bi bi-send"></i>
              {t("startChat")}
            </button>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} onRetry={handleRetry} />
            ))}
            {isLoading && (
              <div className={`flex ${isUrdu ? "justify-end" : "justify-start"}`}>
                <div className="flex items-center gap-2 bg-gray-100 rounded-2xl rounded-tl-sm px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">{t("aiTyping")}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;
