const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // For demo purposes, use a local MongoDB or a free MongoDB Atlas cluster
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;