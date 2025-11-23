import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (text, imageFile = null, voiceFile = null) => {
    if (!text.trim() && !imageFile && !voiceFile) return;

    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date(),
      image: imageFile ? URL.createObjectURL(imageFile) : null,
      voice: voiceFile ? URL.createObjectURL(voiceFile) : null
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(text, imageFile, voiceFile);
      const botMessage = {
        id: Date.now() + 1,
        text: response.message || response.response || 'No response received',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || 'Failed to send message');
      const errorMessage = {
        id: Date.now() + 1,
        text: err.message || 'Failed to send message',
        sender: 'error',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    loading,
    error,
    messagesEndRef
  };
};

