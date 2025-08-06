import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const SearchBar = styled.div`
  padding: 8px 12px;
  background: #f6f6f6;
  border-bottom: 1px solid #e0e0e0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 18px;
  background: white;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #00bfa5;
  }
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f2f2f2;
  cursor: pointer;
  background: ${props => props.selected ? '#ebebeb' : 'white'};
  
  &:hover {
    background: ${props => props.selected ? '#ebebeb' : '#f5f5f5'};
  }
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.color || '#00bfa5'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
  margin-right: 15px;
  flex-shrink: 0;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const ContactName = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #111b21;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: #667781;
  white-space: nowrap;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LastMessage = styled.div`
  font-size: 14px;
  color: #667781;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
`;

const UnreadCount = styled.div`
  background: #00a884;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #667781;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

function ChatList({ conversations, onChatSelect, selectedChat }) {
  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getAvatarColor = (wa_id) => {
    const colors = [
      '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688',
      '#4caf50', '#8bc34a', '#ff9800', '#ff5722'
    ];
    const index = wa_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (conversations.length === 0) {
    return (
      <Container>
        <SearchBar>
          <SearchInput placeholder="Search conversations..." disabled />
        </SearchBar>
        <EmptyState>
          <EmptyIcon>💬</EmptyIcon>
          <EmptyText>No conversations yet</EmptyText>
          <EmptySubtext>
            Process webhook payloads to see conversations here
          </EmptySubtext>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <SearchBar>
        <SearchInput placeholder="Search conversations..." />
      </SearchBar>
      
      {conversations.map((conversation) => (
        <ChatItem
          key={conversation._id}
          selected={selectedChat && selectedChat._id === conversation._id}
          onClick={() => onChatSelect(conversation)}
        >
          <Avatar color={getAvatarColor(conversation._id)}>
            {getInitials(conversation.contact.name)}
          </Avatar>
          
          <ChatInfo>
            <TopRow>
              <ContactName>{conversation.contact.name}</ContactName>
              <Timestamp>{formatTimestamp(conversation.lastTimestamp)}</Timestamp>
            </TopRow>
            
            <BottomRow>
              <LastMessage>{conversation.lastMessage}</LastMessage>
              {conversation.unreadCount > 0 && (
                <UnreadCount>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </UnreadCount>
              )}
            </BottomRow>
          </ChatInfo>
        </ChatItem>
      ))}
    </Container>
  );
}

export default ChatList;