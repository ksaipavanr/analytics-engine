const User = require('../models/User');

const authenticateGoogle = async (req, res, next) => {
  try {
    // Development bypass - always authenticate
    let user = await User.findOne({ email: 'dev@analytics.com' });
    
    if (!user) {
      user = new User({
        googleId: 'dev_user_analytics',
        email: 'dev@analytics.com',
        name: 'Development User'
      });
      await user.save();
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      error: 'Authentication failed'
    });
  }
};

module.exports = {
  authenticateGoogle
};