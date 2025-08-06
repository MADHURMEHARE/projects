const database = require('../config/database');

class Message {
  static getCollection() {
    return database.getCollection('processed_messages');
  }

  static async insertMessage(messageData) {
    try {
      const collection = this.getCollection();
      const result = await collection.insertOne({
        ...messageData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error inserting message:', error);
      throw error;
    }
  }

  static async updateMessageStatus(messageId, status) {
    try {
      const collection = this.getCollection();
      const result = await collection.updateOne(
        { 
          $or: [
            { 'messageId': messageId },
            { 'metaData.entry.changes.value.messages.id': messageId },
            { 'metaData.entry.changes.value.statuses.id': messageId },
            { 'metaData.entry.changes.value.statuses.meta_msg_id': messageId }
          ]
        },
        { 
          $set: { 
            status: status,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }

  static async getConversations() {
    try {
      const collection = this.getCollection();
      const conversations = await collection.aggregate([
        {
          $match: {
            'metaData.entry.changes.value.messages': { $exists: true }
          }
        },
        {
          $addFields: {
            wa_id: {
              $arrayElemAt: ['$metaData.entry.changes.value.contacts.wa_id', 0]
            },
            contact_name: {
              $arrayElemAt: ['$metaData.entry.changes.value.contacts.profile.name', 0]
            },
            message: {
              $arrayElemAt: ['$metaData.entry.changes.value.messages', 0]
            }
          }
        },
        {
          $group: {
            _id: '$wa_id',
            name: { $first: '$contact_name' },
            lastMessage: { $last: '$message.text.body' },
            lastTimestamp: { $last: '$message.timestamp' },
            messageCount: { $sum: 1 }
          }
        },
        {
          $sort: { lastTimestamp: -1 }
        }
      ]).toArray();
      
      return conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  static async getMessagesByContact(wa_id) {
    try {
      const collection = this.getCollection();
      const messages = await collection.find({
        $or: [
          { 'metaData.entry.changes.value.contacts.wa_id': wa_id },
          { 'metaData.entry.changes.value.messages.from': wa_id },
          { 'metaData.entry.changes.value.statuses.recipient_id': wa_id }
        ]
      }).sort({ 'metaData.entry.changes.value.messages.timestamp': 1 }).toArray();
      
      return messages;
    } catch (error) {
      console.error('Error getting messages by contact:', error);
      throw error;
    }
  }

  static async sendMessage(wa_id, messageText, contactName) {
    try {
      const collection = this.getCollection();
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const messageId = `wamid.${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      const messageData = {
        payload_type: 'whatsapp_webhook',
        _id: `sent-${Date.now()}`,
        metaData: {
          entry: [{
            changes: [{
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '918329446654',
                  phone_number_id: '629305560276479'
                },
                contacts: [{
                  profile: {
                    name: contactName || 'Unknown Contact'
                  },
                  wa_id: wa_id
                }],
                messages: [{
                  from: '918329446654', // Our business number
                  id: messageId,
                  timestamp: timestamp,
                  text: {
                    body: messageText
                  },
                  type: 'text'
                }]
              }
            }],
            id: `${Date.now()}`
          }],
          object: 'whatsapp_business_account'
        },
        status: 'sent',
        messageId: messageId,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        executed: true
      };

      const result = await collection.insertOne(messageData);
      return { ...messageData, _id: result.insertedId };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

module.exports = Message;