const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Sample data for demo when database is not connected
const sampleConversations = [
  {
    _id: '919937320320',
    contact: { name: 'Ravi Kumar', wa_id: '919937320320' },
    lastMessage: 'Hi, I\'d like to know more about your services.',
    lastTimestamp: '1754400000',
    messageCount: 2,
    unreadCount: 1
  },
  {
    _id: '929967673820',
    contact: { name: 'Neha Joshi', wa_id: '929967673820' },
    lastMessage: 'Hi, I saw your ad. Can you share more details?',
    lastTimestamp: '1754401000',
    messageCount: 2,
    unreadCount: 0
  }
];

const sampleMessages = {
  '919937320320': [
    {
      _id: 'msg1',
      messageId: 'wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=',
      from: '919937320320',
      to: '918329446654',
      contact: { name: 'Ravi Kumar', wa_id: '919937320320' },
      text: { body: 'Hi, I\'d like to know more about your services.' },
      type: 'text',
      timestamp: '1754400000',
      direction: 'incoming',
      status: 'read'
    },
    {
      _id: 'msg2',
      messageId: 'wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggNDc4NzZBQ0YxMjdCQ0VFOTk2NzA3MTI4RkZCNjYyMjc=',
      from: '918329446654',
      to: '919937320320',
      contact: { name: 'Ravi Kumar', wa_id: '919937320320' },
      text: { body: 'Hi Ravi! Sure, I\'d be happy to help you with that. Could you tell me what you\'re looking for?' },
      type: 'text',
      timestamp: '1754400020',
      direction: 'outgoing',
      status: 'sent'
    }
  ],
  '929967673820': [
    {
      _id: 'msg3',
      messageId: 'wamid.HBgMOTI5OTY3NjczODIwFQIAEhggQ0FBQkNERUYwMDFGRjEyMzQ1NkZGQTk5RTJCM0I2NzY=',
      from: '929967673820',
      to: '918329446654',
      contact: { name: 'Neha Joshi', wa_id: '929967673820' },
      text: { body: 'Hi, I saw your ad. Can you share more details?' },
      type: 'text',
      timestamp: '1754401000',
      direction: 'incoming',
      status: 'read'
    },
    {
      _id: 'msg4',
      messageId: 'wamid.demo_response_neha',
      from: '918329446654',
      to: '929967673820',
      contact: { name: 'Neha Joshi', wa_id: '929967673820' },
      text: { body: 'Hello Neha! Thanks for your interest. I\'d be happy to share more details about our services.' },
      type: 'text',
      timestamp: '1754401060',
      direction: 'outgoing',
      status: 'delivered'
    }
  ]
};

// Get all conversations (grouped by contact)
router.get('/conversations', async (req, res) => {
  try {
    if (!req.isDatabaseConnected) {
      // Return sample data when database is not connected
      return res.json(sampleConversations);
    }

    const conversations = await Message.aggregate([
      {
        $group: {
          _id: '$contact.wa_id',
          contact: { $first: '$contact' },
          lastMessage: { $last: '$text.body' },
          lastTimestamp: { $last: '$timestamp' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$direction', 'incoming'] },
                    { $ne: ['$status', 'read'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastTimestamp: -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:wa_id', async (req, res) => {
  try {
    const { wa_id } = req.params;
    
    if (!req.isDatabaseConnected) {
      // Return sample data when database is not connected
      const messages = sampleMessages[wa_id] || [];
      return res.json(messages);
    }
    
    const messages = await Message.find({
      'contact.wa_id': wa_id
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message (demo - saves to database only)
router.post('/send', async (req, res) => {
  try {
    const { wa_id, name, message } = req.body;
    
    if (!wa_id || !message) {
      return res.status(400).json({ error: 'wa_id and message are required' });
    }

    // Generate a unique message ID
    const messageId = `demo_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    const newMessage = {
      _id: messageId,
      messageId: messageId,
      from: '918329446654', // Business number
      to: wa_id,
      contact: {
        name: name || 'Unknown',
        wa_id: wa_id
      },
      text: {
        body: message
      },
      type: 'text',
      timestamp: timestamp,
      direction: 'outgoing',
      status: 'sent',
      metadata: {
        phone_number_id: '629305560276479',
        display_phone_number: '918329446654'
      }
    };

    if (!req.isDatabaseConnected) {
      // Add to sample data when database is not connected
      if (!sampleMessages[wa_id]) {
        sampleMessages[wa_id] = [];
      }
      sampleMessages[wa_id].push(newMessage);
      
      // Update sample conversations
      const convIndex = sampleConversations.findIndex(c => c._id === wa_id);
      if (convIndex >= 0) {
        sampleConversations[convIndex].lastMessage = message;
        sampleConversations[convIndex].lastTimestamp = timestamp;
        sampleConversations[convIndex].messageCount++;
      } else {
        sampleConversations.push({
          _id: wa_id,
          contact: { name: name || 'Unknown', wa_id: wa_id },
          lastMessage: message,
          lastTimestamp: timestamp,
          messageCount: 1,
          unreadCount: 0
        });
      }
      
      return res.json(newMessage);
    }

    const savedMessage = await new Message(newMessage).save();
    res.json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/conversations/:wa_id/read', async (req, res) => {
  try {
    const { wa_id } = req.params;
    
    if (!req.isDatabaseConnected) {
      // Update sample data when database is not connected
      const convIndex = sampleConversations.findIndex(c => c._id === wa_id);
      if (convIndex >= 0) {
        sampleConversations[convIndex].unreadCount = 0;
      }
      return res.json({ modifiedCount: 1 });
    }
    
    const result = await Message.updateMany(
      { 
        'contact.wa_id': wa_id,
        direction: 'incoming',
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );

    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get message statistics
router.get('/stats', async (req, res) => {
  try {
    if (!req.isDatabaseConnected) {
      // Return sample stats when database is not connected
      const totalMessages = Object.values(sampleMessages).reduce((acc, msgs) => acc + msgs.length, 0);
      const totalConversations = Object.keys(sampleMessages).length;
      const incomingMessages = Object.values(sampleMessages).reduce((acc, msgs) => 
        acc + msgs.filter(m => m.direction === 'incoming').length, 0);
      const outgoingMessages = totalMessages - incomingMessages;
      
      return res.json({
        totalMessages,
        totalConversations,
        incomingMessages,
        outgoingMessages
      });
    }

    const stats = await Message.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalConversations: { $addToSet: '$contact.wa_id' },
          incomingMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'incoming'] }, 1, 0] }
          },
          outgoingMessages: {
            $sum: { $cond: [{ $eq: ['$direction', 'outgoing'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalMessages: 1,
          totalConversations: { $size: '$totalConversations' },
          incomingMessages: 1,
          outgoingMessages: 1
        }
      }
    ]);

    res.json(stats[0] || {
      totalMessages: 0,
      totalConversations: 0,
      incomingMessages: 0,
      outgoingMessages: 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;