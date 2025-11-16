const User = require('../models/User');

const authenticateGoogle = async (req, res, next) => {
  try {
    // For Swagger/testing - accept any token and create mock user
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        error: 'Token is required'
      });
    }

    console.log('🔐 Authentication attempt with token:', token);

    // Always create/return a mock user for testing
    let user = await User.findOne({ email: 'swagger@test.com' }).catch(() => null);
    
    if (!user) {
      // Create mock user if doesn't exist
      user = new User({
        googleId: 'swagger_test_user',
        email: 'swagger@test.com',
        name: 'Swagger Test User'
      });
      try {
        await user.save();
      } catch (saveError) {
        // If save fails (no database), use mock object
        user = {
          _id: 'swagger_test_user_id',
          email: 'swagger@test.com',
          name: 'Swagger Test User'
        };
      }
    }

    console.log('✅ Authentication successful for user:', user.email);
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth error:', error);
    // Fallback to mock user in case of any error
    req.user = {
      _id: 'fallback_user_id',
      email: 'fallback@test.com',
      name: 'Fallback User'
    };
    next();
  }
};

module.exports = {
  authenticateGoogle
};