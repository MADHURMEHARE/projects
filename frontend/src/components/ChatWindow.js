import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #e5ddd5;
`;

const Header = styled.div`
  background: #f0f0f0;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  
  &:hover {
    background: #e0e0e0;
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.color || '#00bfa5'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #111b21;
`;

const ContactNumber = styled.div`
  font-size: 13px;
  color: #667781;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #e5ddd5;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4edda' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
`;

const MessageBubble = styled.div`
  max-width: 65%;
  margin-bottom: 12px;
  margin-left: ${props => props.outgoing ? 'auto' : '0'};
  margin-right: ${props => props.outgoing ? '0' : 'auto'};
`;

const MessageContent = styled.div`
  background: ${props => props.outgoing ? '#dcf8c6' : 'white'};
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
  position: relative;
`;

const MessageText = styled.div`
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  margin-bottom: 4px;
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  font-size: 11px;
  color: #667781;
`;

const StatusIcon = styled.span`
  font-size: 12px;
  color: ${props => {
    switch(props.status) {
      case 'sent': return '#9e9e9e';
      case 'delivered': return '#9e9e9e';
      case 'read': return '#53bdeb';
      default: return '#9e9e9e';
    }
  }};
`;

const InputContainer = styled.div`
  background: #f0f0f0;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 24px;
  background: white;
  font-size: 14px;
  outline: none;
  
  &:focus {
    outline: 2px solid #00bfa5;
  }
`;

const SendButton = styled.button`
  background: #00bfa5;
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  
  &:hover {
    background: #00a693;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #667781;
`;

const DateDivider = styled.div`
  text-align: center;
  margin: 20px 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e0e0e0;
  }
`;

const DateLabel = styled.span`
  background: #e5ddd5;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #667781;
  background: rgba(229, 221, 213, 0.9);
`;

function ChatWindow({ conversation, onBack, onNewMessage, apiBaseUrl }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/messages/conversations/${conversation._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${apiBaseUrl}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wa_id: conversation._id,
          name: conversation.contact.name,
          message: newMessage.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      onNewMessage();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(parseInt(timestamp) * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
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

  const getStatusIcon = (status, direction) => {
    if (direction === 'incoming') return null;
    
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '○';
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach(message => {
      const messageDate = formatDate(message.timestamp);
      
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  if (!conversation) return null;

  return (
    <Container>
      <Header>
        <BackButton onClick={onBack}>←</BackButton>
        <Avatar color={getAvatarColor(conversation._id)}>
          {getInitials(conversation.contact.name)}
        </Avatar>
        <ContactInfo>
          <ContactName>{conversation.contact.name}</ContactName>
          <ContactNumber>+{conversation._id}</ContactNumber>
        </ContactInfo>
      </Header>

      <MessagesContainer>
        {loading ? (
          <LoadingIndicator>Loading messages...</LoadingIndicator>
        ) : (
          <>
            {groupMessagesByDate(messages).map((group, groupIndex) => (
              <div key={groupIndex}>
                <DateDivider>
                  <DateLabel>{group.date}</DateLabel>
                </DateDivider>
                
                {group.messages.map((message) => (
                  <MessageBubble key={message._id} outgoing={message.direction === 'outgoing'}>
                    <MessageContent outgoing={message.direction === 'outgoing'}>
                      <MessageText>{message.text.body}</MessageText>
                      <MessageMeta>
                        <span>{formatTimestamp(message.timestamp)}</span>
                        <StatusIcon status={message.status}>
                          {getStatusIcon(message.status, message.direction)}
                        </StatusIcon>
                      </MessageMeta>
                    </MessageContent>
                  </MessageBubble>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </MessagesContainer>

      <InputContainer>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', flex: 1, gap: '10px' }}>
          <MessageInput
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <SendButton type="submit" disabled={!newMessage.trim() || sending}>
            {sending ? '...' : '➤'}
          </SendButton>
        </form>
      </InputContainer>
    </Container>
  );
}

export default ChatWindow;