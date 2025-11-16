const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // For production, don't try to connect to MongoDB if it's localhost
    if (process.env.NODE_ENV === 'production' && 
        (process.env.MONGODB_URI?.includes('localhost') || 
         process.env.MONGODB_URI?.includes('127.0.0.1'))) {
      console.log('🔧 Production mode: Using mock database (no MongoDB connection)');
      return true;
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // In production, don't crash the app
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Production: Continuing without database connection');
      return true;
    } else {
      // In development, exit if database fails
      console.log('💥 Development: Database connection failed');
      process.exit(1);
    }
  }
};

module.exports = connectDB;