const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const messageRoutes = require('./routes/messages');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global variable to track database connection status
let isDatabaseConnected = false;

// Connect to MongoDB (don't exit on failure)
connectDB().then((connected) => {
  isDatabaseConnected = connected;
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to check database connection
app.use((req, res, next) => {
  req.isDatabaseConnected = isDatabaseConnected;
  next();
});

// Routes
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'WhatsApp Web Clone API',
    database: isDatabaseConnected ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'WhatsApp Web Clone API Server',
    version: '1.0.0',
    database: isDatabaseConnected ? 'Connected' : 'Disconnected',
    note: isDatabaseConnected ? 'Ready to process webhooks' : 'Set up MongoDB for full functionality',
    endpoints: {
      conversations: '/api/messages/conversations',
      messages: '/api/messages/conversations/:wa_id',
      send: '/api/messages/send',
      markRead: '/api/messages/conversations/:wa_id/read',
      stats: '/api/messages/stats'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Web Clone API Server started`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database Status: ${isDatabaseConnected ? 'Connected' : 'Disconnected'}`);
  
  if (!isDatabaseConnected) {
    console.log(`\n📋 To enable full functionality:`);
    console.log(`   1. Set up MongoDB Atlas (free tier available)`);
    console.log(`   2. Or install MongoDB locally`);
    console.log(`   3. Update MONGODB_URI in .env file`);
    console.log(`   4. Run: npm run process-payloads`);
  }
});

module.exports = app;