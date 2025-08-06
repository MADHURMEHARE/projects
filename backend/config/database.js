const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Try to connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp';
    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    console.log('🔄 Continuing without database connection...');
    console.log('📝 Note: For full functionality, set up MongoDB Atlas or local MongoDB');
    return false;
  }
};

module.exports = connectDB;