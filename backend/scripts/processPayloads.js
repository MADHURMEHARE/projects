const fs = require('fs');
const path = require('path');
const connectDB = require('../config/database');
const PayloadProcessor = require('../utils/payloadProcessor');

async function processAllPayloads() {
  try {
    // Connect to database
    await connectDB();
    
    // Path to the payload files (assuming they're in the root directory)
    const payloadDir = path.join(__dirname, '../../');
    
    // Get all JSON files
    const files = fs.readdirSync(payloadDir).filter(file => 
      file.endsWith('.json') && file.includes('conversation')
    );
    
    console.log(`Found ${files.length} payload files to process:`);
    files.forEach(file => console.log(`- ${file}`));
    
    // Process each file
    for (const file of files) {
      try {
        console.log(`\nProcessing ${file}...`);
        
        const filePath = path.join(payloadDir, file);
        const payloadData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const result = await PayloadProcessor.processPayload(payloadData);
        
        if (result) {
          console.log(`✅ Successfully processed ${file}`);
        } else {
          console.log(`⚠️  No data processed from ${file}`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
    
    console.log('\n🎉 Payload processing completed!');
    
    // Display summary
    const Message = require('../models/Message');
    const messageCount = await Message.countDocuments();
    const conversations = await Message.distinct('contact.wa_id');
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total messages: ${messageCount}`);
    console.log(`- Total conversations: ${conversations.length}`);
    console.log(`- Conversation IDs: ${conversations.join(', ')}`);
    
  } catch (error) {
    console.error('Error in payload processing:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
processAllPayloads();