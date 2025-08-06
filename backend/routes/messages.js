const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get all conversations
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Message.getConversations();
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific contact
router.get('/conversations/:wa_id', async (req, res) => {
  try {
    const { wa_id } = req.params;
    const messages = await Message.getMessagesByContact(wa_id);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/send', async (req, res) => {
  try {
    const { wa_id, message, contactName } = req.body;
    
    if (!wa_id || !message) {
      return res.status(400).json({ error: 'wa_id and message are required' });
    }
    
    const result = await Message.sendMessage(wa_id, message, contactName);
    
    // Emit to WebSocket clients if needed
    if (req.app.locals.io) {
      req.app.locals.io.emit('newMessage', result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Webhook endpoint to receive WhatsApp messages
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    
    // Check if it's a status update
    if (payload.metaData?.entry?.[0]?.changes?.[0]?.value?.statuses) {
      const status = payload.metaData.entry[0].changes[0].value.statuses[0];
      await Message.updateMessageStatus(status.id, status.status);
    } else {
      // Insert new message
      await Message.insertMessage(payload);
    }
    
    // Emit to WebSocket clients
    if (req.app.locals.io) {
      req.app.locals.io.emit('messageUpdate', payload);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;