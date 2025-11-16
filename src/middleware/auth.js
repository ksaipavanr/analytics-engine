const Application = require('../models/Application');
const { redisClient } = require('../config/redis');

const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key is required'
      });
    }

    const cachedApp = await redisClient.get(`apiKey:${apiKey}`);
    if (cachedApp) {
      req.application = JSON.parse(cachedApp);
      return next();
    }

    const application = await Application.findOne({
      apiKey,
      isActive: true,
      $or: [
        { apiKeyExpires: null },
        { apiKeyExpires: { $gt: new Date() } }
      ]
    }).populate('owner');

    if (!application) {
      return res.status(401).json({
        error: 'Invalid or expired API key'
      });
    }

    await redisClient.setEx(
      `apiKey:${apiKey}`,
      300,
      JSON.stringify(application.toObject())
    );

    req.application = application;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
};

module.exports = {
  authenticateApiKey
};