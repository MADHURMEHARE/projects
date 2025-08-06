import React from 'react';
import { format } from 'date-fns';

const Sidebar = ({ conversations, activeConversation, onConversationSelect, loading }) => {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return format(date, 'HH:mm');
      } else {
        return format(date, 'dd/MM/yyyy');
      }
    } catch (error) {
      return '';
    }
  };

  const formatPhoneNumber = (wa_id) => {
    if (!wa_id) return '';
    // Format phone number for display
    const phoneStr = wa_id.toString();
    if (phoneStr.length > 10) {
      return `+${phoneStr.slice(0, -10)} ${phoneStr.slice(-10, -5)} ${phoneStr.slice(-5)}`;
    }
    return wa_id;
  };

  if (loading) {
    return (
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>WhatsApp Web</h1>
        </div>
        <div className="loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>WhatsApp Web</h1>
      </div>
      
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="loading">No conversations found</div>
        ) : (
          conversations.map((conversation) => (
            <div 
              key={conversation._id}
              className={`conversation-item ${activeConversation?._id === conversation._id ? 'active' : ''}`}
              onClick={() => onConversationSelect(conversation)}
            >
              <div className="avatar">
                {getInitials(conversation.name)}
              </div>
              
              <div className="conversation-info">
                <div className="conversation-name">
                  {conversation.name || formatPhoneNumber(conversation._id)}
                </div>
                <div className="conversation-preview">
                  {conversation.lastMessage || 'No messages yet'}
                </div>
              </div>
              
              {conversation.lastTimestamp && (
                <div className="conversation-time">
                  {formatTime(conversation.lastTimestamp)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;