import { chatAPI } from './api';
import { generateId } from '../utils/helpers';

export class ChatService {
  static messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');

  static async sendMessage(content, type = 'text', language = 'urdu') {
    try {
      const response = await chatAPI.sendMessage(content, type, language);
      
      if (response.data.success) {
        const { userMessage, aiMessage } = response.data.data;
        
        // Update local storage
        this.messages.push({
          id: userMessage.id || generateId(),
          content: userMessage.content,
          type: userMessage.type,
          sender: 'user',
          timestamp: userMessage.timestamp,
          language,
          status: 'sent'
        });
        
        this.messages.push({
          id: aiMessage.id || generateId(),
          content: aiMessage.content,
          type: aiMessage.type,
          sender: 'ai',
          timestamp: aiMessage.timestamp,
          language,
          status: 'delivered',
          analysis: aiMessage.analysis,
          metadata: aiMessage.metadata
        });
        
        this.saveToLocalStorage();
        this.emitMessageUpdate();
        
        return {
          id: aiMessage.id,
          content: aiMessage.content,
          type: aiMessage.type,
          sender: 'ai',
          timestamp: aiMessage.timestamp,
          language,
          status: 'delivered',
          analysis: aiMessage.analysis
        };
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  static async loadMessages() {
    try {
      const response = await chatAPI.getMessages();
      if (response.data.success) {
        this.messages = response.data.data.messages.map(msg => ({
          id: msg._id || msg.id,
          content: msg.content,
          type: msg.type,
          sender: msg.sender,
          timestamp: msg.createdAt || msg.timestamp,
          language: msg.language,
          status: msg.status,
          analysis: msg.analysis,
          metadata: msg.metadata
        }));
        this.saveToLocalStorage();
        this.emitMessageUpdate();
        return this.messages;
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  }

  static async clearMessages() {
    try {
      await chatAPI.clearMessages();
      this.messages = [];
      this.saveToLocalStorage();
      this.emitMessageUpdate();
    } catch (error) {
      console.error('Failed to clear messages:', error);
      throw error;
    }
  }

  static getMessages() {
    return this.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  static getMessageById(messageId) {
    return this.messages.find(msg => msg.id === messageId);
  }

  static getMessagesByType(type) {
    return this.messages.filter(msg => msg.type === type);
  }

  static saveToLocalStorage() {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save messages to localStorage:', error);
    }
  }

  static emitMessageUpdate() {
    window.dispatchEvent(new CustomEvent('chatMessagesUpdated'));
  }

  static subscribe(callback) {
    const handler = () => callback(this.getMessages());
    window.addEventListener('chatMessagesUpdated', handler);
    return () => window.removeEventListener('chatMessagesUpdated', handler);
  }

  static getConversationStats() {
    const totalMessages = this.messages.length;
    const userMessages = this.messages.filter(msg => msg.sender === 'user').length;
    const aiMessages = this.messages.filter(msg => msg.sender === 'ai').length;
    const failedMessages = this.messages.filter(msg => msg.status === 'failed').length;

    return {
      totalMessages,
      userMessages,
      aiMessages,
      failedMessages,
      successRate: totalMessages > 0 ? ((totalMessages - failedMessages) / totalMessages * 100).toFixed(1) : 0
    };
  }
}

// Initialize from localStorage on module load
ChatService.messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
