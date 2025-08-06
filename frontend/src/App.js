import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f0f0f0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Sidebar = styled.div`
  width: 400px;
  min-width: 300px;
  border-right: 1px solid #e0e0e0;
  background: white;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    display: ${props => props.showChat ? 'none' : 'flex'};
  }
`;

const Header = styled.div`
  background: #00bfa5;
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
`;

const Status = styled.div`
  font-size: 13px;
  opacity: 0.9;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: ${props => props.showChat ? 'flex' : 'none'};
  }
`;

const WelcomeScreen = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  text-align: center;
  padding: 20px;
`;

const WelcomeIcon = styled.div`
  width: 200px;
  height: 200px;
  background: #00bfa5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  font-size: 80px;
  color: white;
`;

const WelcomeTitle = styled.h2`
  color: #41525d;
  font-size: 32px;
  font-weight: 300;
  margin-bottom: 15px;
`;

const WelcomeText = styled.p`
  color: #667781;
  font-size: 14px;
  max-width: 450px;
  line-height: 1.5;
`;

function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/messages/conversations`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (conversation) => {
    setSelectedChat(conversation);
    setShowChat(true);
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedChat(null);
  };

  const handleNewMessage = () => {
    // Refresh conversations when a new message is sent
    fetchConversations();
  };

  if (loading) {
    return (
      <AppContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '100%' 
        }}>
          <div>Loading...</div>
        </div>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '100%',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ color: '#e53e3e', fontSize: '18px' }}>Error: {error}</div>
          <button 
            onClick={fetchConversations}
            style={{
              padding: '10px 20px',
              background: '#00bfa5',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Sidebar showChat={showChat}>
        <Header>
          <Avatar>W</Avatar>
          <HeaderInfo>
            <Title>WhatsApp Web Clone</Title>
            <Status>{conversations.length} conversations</Status>
          </HeaderInfo>
        </Header>
        <ChatList 
          conversations={conversations} 
          onChatSelect={handleChatSelect}
          selectedChat={selectedChat}
        />
      </Sidebar>
      
      <MainContent showChat={showChat}>
        {selectedChat ? (
          <ChatWindow 
            conversation={selectedChat}
            onBack={handleBackToList}
            onNewMessage={handleNewMessage}
            apiBaseUrl={API_BASE_URL}
          />
        ) : (
          <WelcomeScreen>
            <WelcomeIcon>💬</WelcomeIcon>
            <WelcomeTitle>WhatsApp Web Clone</WelcomeTitle>
            <WelcomeText>
              Welcome to WhatsApp Web Clone! Select a conversation from the sidebar to start chatting.
              This is a demo application that displays WhatsApp-like conversations using webhook data.
            </WelcomeText>
          </WelcomeScreen>
        )}
      </MainContent>
    </AppContainer>
  );
}

export default App;
