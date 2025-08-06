const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get all conversations (grouped by contact)
router.get('/conversations', async (req, res) => {
  try {
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
    
    const newMessage = new Message({
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
      timestamp: Math.floor(Date.now() / 1000).toString(),
      direction: 'outgoing',
      status: 'sent',
      metadata: {
        phone_number_id: '629305560276479',
        display_phone_number: '918329446654'
      }
    });

    const savedMessage = await newMessage.save();
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