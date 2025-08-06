const fs = require('fs').promises;
const path = require('path');
const database = require('../config/database');
const Message = require('../models/Message');

async function seedData() {
  try {
    console.log('Connecting to database...');
    await database.connect();
    
    console.log('Clearing existing data...');
    const collection = Message.getCollection();
    await collection.deleteMany({});
    
    console.log('Reading sample payload files...');
    const sampleFiles = [
      'conversation_1_message_1.json',
      'conversation_1_message_2.json',
      'conversation_1_status_1.json',
      'conversation_1_status_2.json',
      'conversation_2_message_1.json',
      'conversation_2_message_2.json',
      'conversation_2_status_1.json',
      'conversation_2_status_2.json'
    ];
    
    for (const file of sampleFiles) {
      try {
        const filePath = path.join(process.cwd(), '..', file);
        console.log(`Processing ${file}...`);
        
        const data = await fs.readFile(filePath, 'utf8');
        const payload = JSON.parse(data);
        
        // Check if it's a status update
        if (payload.metaData?.entry?.[0]?.changes?.[0]?.value?.statuses) {
          const status = payload.metaData.entry[0].changes[0].value.statuses[0];
          console.log(`Updating status for message ${status.id} to ${status.status}`);
          await Message.updateMessageStatus(status.id, status.status);
        } else {
          // Insert message
          console.log(`Inserting message: ${payload._id}`);
          await Message.insertMessage(payload);
        }
        
      } catch (fileError) {
        console.error(`Error processing ${file}:`, fileError.message);
      }
    }
    
    console.log('Sample data seeded successfully!');
    
    // Display inserted data
    const conversations = await Message.getConversations();
    console.log('\nConversations found:');
    conversations.forEach(conv => {
      console.log(`- ${conv.name} (${conv._id}): ${conv.lastMessage}`);
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await database.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;