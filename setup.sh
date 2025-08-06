#!/bin/bash

echo "🚀 Setting up WhatsApp Web Clone..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up your MongoDB connection in backend/.env"
echo "2. Run 'cd backend && npm run seed' to load sample data (optional)"
echo "3. Start backend: 'cd backend && npm run dev'"
echo "4. Start frontend: 'cd frontend && npm start' (in new terminal)"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For deployment instructions, see README.md"