import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Check, CheckCheck } from 'lucide-react';
import { messageAPI } from '../services/api';

const ChatArea = ({ activeConversation, messages, onSendMessage, loading }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      return format(date, 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  const formatPhoneNumber = (wa_id) => {
    if (!wa_id) return '';
    const phoneStr = wa_id.toString();
    if (phoneStr.length > 10) {
      return `+${phoneStr.slice(0, -10)} ${phoneStr.slice(-10, -5)} ${phoneStr.slice(-5)}`;
    }
    return wa_id;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await onSendMessage(activeConversation._id, messageText, activeConversation.name);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message text on error
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const renderMessage = (messageData, index) => {
    const message = messageData.metaData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = messageData.metaData?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
    
    if (!message) return null;

    // Determine if message is sent by us (business) or received from user
    const isSent = message.from === '918329446654'; // Our business number
    const messageText = message.text?.body || '';
    const timestamp = message.timestamp;
    const status = messageData.status || 'sent';

    return (
      <div key={index} className={`message ${isSent ? 'sent' : 'received'}`}>
        <div className="message-bubble">
          <div className="message-text">{messageText}</div>
          <div className="message-footer">
            <span className="message-time">{formatTime(timestamp)}</span>
            {isSent && (
              <div className="message-status">
                {status === 'delivered' || status === 'read' ? (
                  <CheckCheck size={16} color="#53bdeb" />
                ) : (
                  <Check size={16} color="#8696a0" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!activeConversation) {
    return (
      <div className="chat-area">
        <div className="empty-chat">
          <div className="empty-chat-icon">
            <svg viewBox="0 0 303 172" width="360" height="207">
              <path fill="#DDD" d="M219.317 141.162c8.219 0 14.875-6.651 14.875-14.858s-6.656-14.858-14.875-14.858c-8.212 0-14.869 6.651-14.869 14.858s6.657 14.858 14.869 14.858zm0-26.16c6.228 0 11.294 5.06 11.294 11.302 0 6.242-5.066 11.302-11.294 11.302-6.222 0-11.288-5.06-11.288-11.302 0-6.242 5.066-11.302 11.288-11.302z"/>
            </svg>
          </div>
          <h2>WhatsApp Web</h2>
          <p>Send and receive messages without keeping your phone online.<br/>
             Use WhatsApp on up to 4 linked devices and 1 phone at the same time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-avatar">
          {getInitials(activeConversation.name)}
        </div>
        <div className="chat-info">
          <div className="chat-name">
            {activeConversation.name || formatPhoneNumber(activeConversation._id)}
          </div>
          <div className="chat-status">
            {formatPhoneNumber(activeConversation._id)}
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="loading">No messages yet</div>
        ) : (
          messages.map((messageData, index) => renderMessage(messageData, index))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          className="message-input"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={sending}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim() || sending}
        >
          <Send size={20} color="white" />
        </button>
      </form>
    </div>
  );
};

export default ChatArea;