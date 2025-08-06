import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { messageAPI } from './services/api';
import { initSocket, getSocket } from './services/socket';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Initialize Socket.IO connection
  useEffect(() => {
    const socket = initSocket();

    // Listen for new messages
    socket.on('newMessage', (newMessage) => {
      console.log('New message received:', newMessage);
      // Refresh conversations to update last message
      loadConversations();
      
      // If the message is for the active conversation, add it to messages
      if (activeConversation && 
          (newMessage.metaData?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id === activeConversation._id ||
           newMessage.metaData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from === activeConversation._id)) {
        setMessages(prev => [...prev, newMessage]);
      }
    });

    // Listen for message updates (status changes)
    socket.on('messageUpdate', (updatedMessage) => {
      console.log('Message updated:', updatedMessage);
      // Update message status in current messages
      if (activeConversation) {
        setMessages(prev => prev.map(msg => {
          const msgId = msg.metaData?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id;
          const updateId = updatedMessage.metaData?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id;
          if (msgId === updateId) {
            return { ...msg, status: updatedMessage.metaData.entry[0].changes[0].value.statuses[0].status };
          }
          return msg;
        }));
      }
    });

    return () => {
      socket.off('newMessage');
      socket.off('messageUpdate');
    };
  }, [activeConversation]);

  // Load conversations on app start
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await messageAPI.getConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (wa_id) => {
    try {
      setMessagesLoading(true);
      const messagesData = await messageAPI.getMessages(wa_id);
      setMessages(messagesData);
      
      // Join the room for this conversation
      const socket = getSocket();
      socket.emit('joinRoom', wa_id);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    loadMessages(conversation._id);
  };

  const handleSendMessage = async (wa_id, messageText, contactName) => {
    try {
      const sentMessage = await messageAPI.sendMessage(wa_id, messageText, contactName);
      
      // Add the message to the current messages immediately
      setMessages(prev => [...prev, sentMessage]);
      
      // Refresh conversations to update last message
      loadConversations();
      
      return sentMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return (
    <div className="app">
      <Sidebar 
        conversations={conversations}
        activeConversation={activeConversation}
        onConversationSelect={handleConversationSelect}
        loading={loading}
      />
      <ChatArea 
        activeConversation={activeConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={messagesLoading}
      />
    </div>
  );
}

export default App;