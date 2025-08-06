const Message = require('../models/Message');

class PayloadProcessor {
  
  // Process incoming message payload
  static async processMessage(payload) {
    try {
      const entry = payload.metaData.entry[0];
      const change = entry.changes[0];
      const value = change.value;
      
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const contact = value.contacts[0];
        
        // Determine direction based on sender
        const businessNumber = value.metadata.display_phone_number;
        const direction = message.from === businessNumber ? 'outgoing' : 'incoming';
        
        const messageData = {
          messageId: message.id,
          from: message.from,
          to: direction === 'incoming' ? businessNumber : contact.wa_id,
          contact: {
            name: contact.profile.name,
            wa_id: contact.wa_id
          },
          text: {
            body: message.text.body
          },
          type: message.type,
          timestamp: message.timestamp,
          direction: direction,
          status: direction === 'incoming' ? 'received' : 'sent',
          metadata: {
            entry_id: entry.id,
            phone_number_id: value.metadata.phone_number_id,
            display_phone_number: value.metadata.display_phone_number
          }
        };
        
        // Use upsert to avoid duplicates
        const result = await Message.findOneAndUpdate(
          { messageId: message.id },
          messageData,
          { upsert: true, new: true }
        );
        
        console.log(`Processed message: ${result.messageId}`);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Error processing message payload:', error);
      throw error;
    }
  }
  
  // Process status update payload
  static async processStatus(payload) {
    try {
      const entry = payload.metaData.entry[0];
      const change = entry.changes[0];
      const value = change.value;
      
      if (value.statuses && value.statuses.length > 0) {
        const status = value.statuses[0];
        
        // Update message status using either id or meta_msg_id
        const messageId = status.id || status.meta_msg_id;
        
        const result = await Message.findOneAndUpdate(
          { messageId: messageId },
          { 
            status: status.status,
            updatedAt: new Date()
          },
          { new: true }
        );
        
        if (result) {
          console.log(`Updated message status: ${messageId} -> ${status.status}`);
          return result;
        } else {
          console.log(`Message not found for status update: ${messageId}`);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error processing status payload:', error);
      throw error;
    }
  }
  
  // Main processor function
  static async processPayload(payload) {
    try {
      const entry = payload.metaData.entry[0];
      const change = entry.changes[0];
      const value = change.value;
      
      // Check if this is a message or status payload
      if (value.messages && value.messages.length > 0) {
        return await this.processMessage(payload);
      } else if (value.statuses && value.statuses.length > 0) {
        return await this.processStatus(payload);
      }
      
      console.log('Payload type not recognized');
      return null;
    } catch (error) {
      console.error('Error processing payload:', error);
      throw error;
    }
  }
}

module.exports = PayloadProcessor;