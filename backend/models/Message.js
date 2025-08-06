const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  // WhatsApp message ID
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Sender information
  from: {
    type: String,
    required: true
  },
  
  // Recipient information (business phone number)
  to: {
    type: String,
    required: true
  },
  
  // Contact information
  contact: {
    name: {
      type: String,
      required: true
    },
    wa_id: {
      type: String,
      required: true
    }
  },
  
  // Message content
  text: {
    body: {
      type: String,
      required: true
    }
  },
  
  // Message type (text, image, etc.)
  type: {
    type: String,
    default: 'text'
  },
  
  // Message timestamp (from WhatsApp)
  timestamp: {
    type: String,
    required: true
  },
  
  // Message status (sent, delivered, read)
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'pending'],
    default: 'pending'
  },
  
  // Direction (incoming/outgoing)
  direction: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true
  },
  
  // Original webhook payload metadata
  metadata: {
    entry_id: String,
    phone_number_id: String,
    display_phone_number: String
  },
  
  // Created at timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Updated at timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
MessageSchema.index({ 'contact.wa_id': 1, timestamp: 1 });
MessageSchema.index({ messageId: 1 });

module.exports = mongoose.model('Message', MessageSchema);