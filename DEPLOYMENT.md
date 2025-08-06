# Deployment Guide

This guide provides step-by-step instructions for deploying the WhatsApp Web Clone to cloud platforms.

## 🚀 Quick Deploy Links

### Option 1: Render + Vercel (Recommended)

#### Backend on Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. **Create Render Account**: [https://render.com](https://render.com)
2. **New Web Service**: Connect GitHub repo, select `backend` folder
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
   ```

#### Frontend on Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. **Create Vercel Account**: [https://vercel.com](https://vercel.com)
2. **Import Git Repository**: Select your repo
3. **Root Directory**: Set to `frontend`
4. **Framework Preset**: Create React App (auto-detected)
5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

### Option 2: Heroku (Both frontend & backend)

#### Backend
```bash
cd backend
heroku create your-app-backend
heroku addons:create mongolab:sandbox
heroku config:set NODE_ENV=production
git push heroku main
```

#### Frontend
```bash
cd frontend
heroku create your-app-frontend
heroku buildpacks:set mars/create-react-app
heroku config:set REACT_APP_API_URL=https://your-app-backend.herokuapp.com
git push heroku main
```

## 🗄️ Database Setup

### MongoDB Atlas (Free Tier)

1. **Create Account**: [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Choose free tier (M0)
3. **Database Access**: Create user with read/write access
4. **Network Access**: Add your IP (or 0.0.0.0/0 for all)
5. **Connect**: Get connection string
6. **Environment Variable**: Set MONGODB_URI

### Render PostgreSQL (Alternative)
```bash
# If using Render's PostgreSQL instead
heroku addons:create heroku-postgresql:hobby-dev
```

## 🔧 Environment Configuration

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/whatsapp?retryWrites=true&w=majority
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://your-backend-domain.onrender.com
```

## 📦 Pre-deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Backend environment variables set
- [ ] Frontend API URL configured
- [ ] CORS settings updated for production domains
- [ ] Socket.IO origins configured for production
- [ ] Sample data seeded (optional)

## 🧪 Testing Deployment

### Health Check Endpoints
- Backend: `https://your-backend.onrender.com/health`
- Frontend: `https://your-frontend.vercel.app`

### API Testing
```bash
# Test conversations endpoint
curl https://your-backend.onrender.com/api/messages/conversations

# Test webhook endpoint
curl -X POST https://your-backend.onrender.com/api/messages/webhook \
  -H "Content-Type: application/json" \
  -d @conversation_1_message_1.json
```

## 🔄 Seeding Production Data

1. **SSH into Render instance** (if needed):
   ```bash
   render shell your-service-id
   npm run seed
   ```

2. **Or use webhook endpoint** to add sample data:
   ```bash
   for file in *.json; do
     curl -X POST https://your-backend.onrender.com/api/messages/webhook \
       -H "Content-Type: application/json" \
       -d @"$file"
   done
   ```

## 🌐 Custom Domain Setup

### Frontend (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown

### Backend (Render)
1. Go to Render Dashboard → Your Service → Settings
2. Add custom domain in "Custom Domains" section
3. Configure DNS CNAME record

## 🔒 Security Considerations

### Production Checklist
- [ ] Update CORS origins to production domains
- [ ] Set secure MongoDB credentials
- [ ] Enable MongoDB IP whitelisting
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Enable HTTPS only
- [ ] Add security headers

### Environment Security
```javascript
// Update server.js CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-frontend-domain.vercel.app"] 
    : ["http://localhost:3000"],
  credentials: true
}));
```

## 📊 Monitoring & Logs

### Render Monitoring
- View logs: Render Dashboard → Service → Logs
- Monitor health: Built-in health checks
- Metrics: CPU, Memory, Response time

### Vercel Analytics
- Enable in Vercel Dashboard → Project → Analytics
- Monitor performance and usage

## 🚨 Troubleshooting

### Common Issues

1. **CORS Error**: Update frontend API URL and backend CORS origins
2. **Database Connection**: Check MongoDB URI and IP whitelist
3. **Build Failures**: Verify Node.js version compatibility
4. **Socket.IO Issues**: Update origins in production config

### Debug Commands
```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Check MongoDB connection
mongo "mongodb+srv://cluster.mongodb.net/test" --username your-username

# View application logs
render logs your-service-id --tail
```

## 📱 Mobile Testing

Test the responsive design on various devices:
- iOS Safari
- Android Chrome
- Desktop browsers
- Tablet view

## 🎯 Performance Optimization

### Production Optimizations Applied
- Gzip compression
- Static asset caching
- Database indexing
- React production build
- Image optimization
- CDN delivery (Vercel)

## 📈 Scaling Considerations

For high traffic:
1. **Database**: Upgrade MongoDB Atlas tier
2. **Backend**: Upgrade Render instance
3. **Frontend**: Vercel auto-scales
4. **Caching**: Add Redis for session storage
5. **Load Balancing**: Multiple backend instances

---

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review logs in platform dashboards
3. Test API endpoints directly
4. Verify environment variables
5. Check CORS and domain configurations