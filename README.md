(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/README.md b/README.md
--- a/README.md
+++ b/README.md
@@ -1,2 +1,344 @@
-# projects
-A simple course website built using pure HTML. This project includes essential sections like course details, schedules, and instructor information. Designed for straightforward navigation, it provides a basic, functional structure without the use of CSS or additional styling.
+# WhatsApp Web Clone
+
+A WhatsApp Web-like chat interface that displays real-time conversations using webhook data. This application mimics WhatsApp Web's design and functionality, allowing users to view conversations and send messages (stored locally, not sent externally).
+
+## 🚀 Live Demo
+
+- **Frontend**: [https://whatsapp-web-clone-frontend.vercel.app](https://whatsapp-web-clone-frontend.vercel.app)
+- **Backend API**: [https://whatsapp-web-backend.onrender.com](https://whatsapp-web-backend.onrender.com)
+
+## ✨ Features
+
+- **WhatsApp Web-like Interface**: Authentic design and user experience
+- **Real-time Communication**: Socket.IO for instant message updates
+- **Webhook Processing**: Handles WhatsApp Business API webhook payloads
+- **Message Status Tracking**: Shows sent, delivered, and read status
+- **Responsive Design**: Works seamlessly on mobile and desktop
+- **MongoDB Integration**: Persistent message storage
+- **Demo Messaging**: Send messages for demo purposes (stored locally)
+
+## 🏗️ Architecture
+
+### Backend (Node.js)
+- **Express.js** server with REST API
+- **MongoDB** for data persistence
+- **Socket.IO** for real-time communication
+- **Webhook endpoints** for receiving WhatsApp data
+- **Message status tracking** and updates
+
+### Frontend (React)
+- **React 18** with modern hooks
+- **Socket.IO client** for real-time updates
+- **Responsive CSS** with WhatsApp Web styling
+- **Lucide React** icons
+- **Date-fns** for time formatting
+
+## 📁 Project Structure
+
+```
+├── backend/
+│   ├── config/
+│   │   └── database.js          # MongoDB connection
+│   ├── models/
+│   │   └── Message.js           # Message model and operations
+│   ├── routes/
+│   │   └── messages.js          # API routes
+│   ├── scripts/
+│   │   └── seedData.js          # Database seeding script
+│   ├── server.js                # Main server file
+│   ├── package.json
+│   ├── Dockerfile
+│   └── render.yaml              # Render deployment config
+├── frontend/
+│   ├── src/
+│   │   ├── components/
+│   │   │   ├── Sidebar.js       # Conversations list
+│   │   │   └── ChatArea.js      # Chat interface
+│   │   ├── services/
+│   │   │   ├── api.js           # API service
+│   │   │   └── socket.js        # Socket.IO service
+│   │   ├── App.js               # Main app component
+│   │   ├── App.css              # WhatsApp Web styles
+│   │   └── index.js
+│   ├── public/
+│   ├── package.json
+│   ├── Dockerfile
+│   ├── nginx.conf
+│   └── vercel.json              # Vercel deployment config
+└── sample webhook files (.json)
+```
+
+## 🛠️ Local Development
+
+### Prerequisites
+- Node.js 16+ 
+- MongoDB (local or cloud)
+- npm or yarn
+
+### Backend Setup
+
+1. **Navigate to backend directory**:
+   ```bash
+   cd backend
+   ```
+
+2. **Install dependencies**:
+   ```bash
+   npm install
+   ```
+
+3. **Configure environment**:
+   ```bash
+   cp .env.example .env
+   # Edit .env with your MongoDB connection string
+   ```
+
+4. **Seed sample data** (optional):
+   ```bash
+   npm run seed
+   ```
+
+5. **Start development server**:
+   ```bash
+   npm run dev
+   ```
+
+### Frontend Setup
+
+1. **Navigate to frontend directory**:
+   ```bash
+   cd frontend
+   ```
+
+2. **Install dependencies**:
+   ```bash
+   npm install
+   ```
+
+3. **Start development server**:
+   ```bash
+   npm start
+   ```
+
+The application will be available at:
+- Frontend: http://localhost:3000
+- Backend: http://localhost:5000
+
+## 🌐 Deployment
+
+### Backend Deployment (Render)
+
+1. **Create a Render account** at [render.com](https://render.com)
+
+2. **Create a new Web Service**:
+   - Connect your GitHub repository
+   - Select the `backend` directory
+   - Use the provided `render.yaml` configuration
+
+3. **Environment Variables**:
+   ```
+   NODE_ENV=production
+   MONGODB_URI=your_mongodb_connection_string
+   PORT=10000
+   ```
+
+4. **MongoDB Database**:
+   - Create a MongoDB Atlas cluster or use Render's PostgreSQL (with MongoDB adapter)
+   - Update the connection string in environment variables
+
+### Frontend Deployment (Vercel)
+
+1. **Create a Vercel account** at [vercel.com](https://vercel.com)
+
+2. **Deploy from GitHub**:
+   - Import your repository
+   - Select the `frontend` directory as root
+   - Vercel will automatically detect it's a React app
+
+3. **Environment Variables**:
+   ```
+   REACT_APP_API_URL=https://your-backend-url.onrender.com
+   ```
+
+4. **Custom Domain** (optional):
+   - Add your custom domain in Vercel dashboard
+   - Configure DNS settings
+
+### Alternative Deployment Options
+
+#### Docker Deployment
+```bash
+# Backend
+cd backend
+docker build -t whatsapp-backend .
+docker run -p 5000:5000 -e MONGODB_URI=your_connection_string whatsapp-backend
+
+# Frontend
+cd frontend
+docker build -t whatsapp-frontend .
+docker run -p 80:80 whatsapp-frontend
+```
+
+#### Heroku Deployment
+```bash
+# Backend
+cd backend
+heroku create whatsapp-backend
+heroku addons:create mongolab:sandbox
+git push heroku main
+
+# Frontend
+cd frontend
+heroku create whatsapp-frontend
+heroku buildpacks:set mars/create-react-app
+git push heroku main
+```
+
+## 📱 API Documentation
+
+### Webhook Endpoint
+```
+POST /api/messages/webhook
+```
+Receives WhatsApp Business API webhook payloads
+
+### Get Conversations
+```
+GET /api/messages/conversations
+```
+Returns all conversations with last message info
+
+### Get Messages
+```
+GET /api/messages/conversations/:wa_id
+```
+Returns all messages for a specific contact
+
+### Send Message
+```
+POST /api/messages/send
+Body: {
+  "wa_id": "919999999999",
+  "message": "Hello World",
+  "contactName": "John Doe"
+}
+```
+
+## 🎯 Webhook Payload Format
+
+The application processes WhatsApp Business API webhook payloads:
+
+```json
+{
+  "payload_type": "whatsapp_webhook",
+  "_id": "unique_id",
+  "metaData": {
+    "entry": [{
+      "changes": [{
+        "field": "messages",
+        "value": {
+          "contacts": [{
+            "profile": { "name": "Contact Name" },
+            "wa_id": "919999999999"
+          }],
+          "messages": [{
+            "from": "919999999999",
+            "id": "message_id",
+            "timestamp": "1754400000",
+            "text": { "body": "Message content" },
+            "type": "text"
+          }]
+        }
+      }]
+    }]
+  }
+}
+```
+
+## 🎨 Features Implemented
+
+### ✅ Task 1: Webhook Payload Processor
+- [x] Read and process JSON webhook payloads
+- [x] Insert messages into MongoDB collection
+- [x] Update message status using id/meta_msg_id
+- [x] Handle both message and status payloads
+
+### ✅ Task 2: WhatsApp Web Interface
+- [x] WhatsApp Web-like design and layout
+- [x] Conversations grouped by user (wa_id)
+- [x] Message bubbles with timestamps
+- [x] Status indicators (sent, delivered, read)
+- [x] User info display (name and number)
+- [x] Responsive design for mobile and desktop
+
+### ✅ Task 3: Send Message Demo
+- [x] Message input box like WhatsApp Web
+- [x] Real-time message display
+- [x] Database storage for sent messages
+- [x] No external message sending (demo only)
+
+### ✅ Task 4: Deployment
+- [x] Backend deployed on Render
+- [x] Frontend deployed on Vercel
+- [x] Public URL accessible without setup
+- [x] MongoDB Atlas integration
+
+## 🔧 Technical Decisions
+
+1. **MongoDB over SQL**: Better suited for document-based webhook payloads
+2. **Socket.IO**: Real-time communication for instant message updates
+3. **React with Hooks**: Modern React patterns for better performance
+4. **Separate Frontend/Backend**: Allows independent scaling and deployment
+5. **Cloud Deployment**: Render (backend) + Vercel (frontend) for reliability
+
+## 🚀 Performance Optimizations
+
+- Database indexing on wa_id and message timestamps
+- Gzip compression for API responses
+- React component memoization
+- Efficient MongoDB aggregation queries
+- CDN delivery for static assets
+
+## 🔐 Security Features
+
+- CORS configuration for cross-origin requests
+- Input validation and sanitization
+- Rate limiting (can be added)
+- Environment variable protection
+- Security headers in nginx configuration
+
+## 🐛 Known Limitations
+
+- Demo messaging only (no actual WhatsApp integration)
+- File attachments not implemented
+- Voice messages not supported
+- Group chats not implemented
+- Message encryption not included
+
+## 🔮 Future Enhancements
+
+- [ ] File and media message support
+- [ ] Voice message playback
+- [ ] Group chat functionality
+- [ ] Message search
+- [ ] Dark/light theme toggle
+- [ ] Push notifications
+- [ ] Message encryption
+- [ ] Contact management
+
+## 🤝 Contributing
+
+1. Fork the repository
+2. Create a feature branch
+3. Make your changes
+4. Add tests if applicable
+5. Submit a pull request
+
+## 📄 License
+
+This project is for educational and demonstration purposes only.
+
+---
+
+**⚠️ Important Note**: This is a demo application that simulates WhatsApp Web interface. It does not actually send messages through WhatsApp's systems and is intended for learning and demonstration purposes only.
+
EOF
)
