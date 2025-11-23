const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes.js');
const chatRoutes = require('./routes/chat.routes.js');
const uploadRoutes = require('./routes/upload.routes.js');
const { errorHandler } = require('./middleware/errorHandler.js');
const { getClientStatus } = require('./services/aiService.js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection with improved error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agriculture-chat';
    
    // Check if using MongoDB Atlas (SRV connection string)
    if (mongoURI.includes('mongodb+srv://')) {
      console.log('🔗 Connecting to MongoDB Atlas...');
    } else {
      console.log('🔗 Connecting to MongoDB...');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check if MongoDB is running (for local)');
      console.error('2. Verify your MONGODB_URI in .env file');
      console.error('3. For MongoDB Atlas:');
      console.error('   - Ensure your IP is whitelisted (0.0.0.0/0 for all IPs)');
      console.error('   - Check network access in Atlas dashboard');
      console.error('   - Verify connection string format');
      console.error('4. Check your internet connection');
      console.error('5. Try using local MongoDB: mongodb://localhost:27017/agriculture-chat\n');
    } else if (error.code === 'ENOTFOUND' || error.message.includes('querySrv')) {
      console.error('\n💡 DNS/Network issues detected:');
      console.error('1. Check your internet connection');
      console.error('2. Try using a different DNS server (Google DNS: 8.8.8.8)');
      console.error('3. For MongoDB Atlas, ensure network access is enabled');
      console.error('4. Try using IPv4 explicitly (already set in connection options)\n');
    }
    
    // Don't exit in development - allow server to start for testing other features
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Server will continue without database connection (development mode)');
    }
  }
};

connectDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Agriculture Chat API is running',
    timestamp: new Date().toISOString()
  });
});

// AI Status debug endpoint
app.get('/api/debug/ai-status', (req, res) => {
  const status = getClientStatus();
  res.json({
    success: true,
    clients: status,
    environment: {
      HF_TOKEN: process.env.HF_TOKEN ? 'Set (' + process.env.HF_TOKEN.substring(0, 10) + '...)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('HF') || key.includes('HUGGING'))
    },
    serverInfo: {
      cwd: process.cwd(),
      envFile: '.env'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;