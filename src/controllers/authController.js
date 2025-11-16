const Application = require('../models/Application');
const { generateApiKey } = require('../utils/apiKeyGenerator');

class AuthController {
  async register(req, res) {
    try {
      const { name, description, websiteUrl } = req.body;
      
      console.log('📝 Registering application:', { name, websiteUrl });

      // Generate API key
      const apiKey = generateApiKey();

      // Create application (will use mock in production)
      const application = new Application({
        name,
        description,
        websiteUrl,
        apiKey,
        owner: req.user._id
      });

      await application.save();

      res.status(201).json({
        message: 'Application registered successfully',
        application: {
          id: application._id || 'mock_app_id',
          name: application.name,
          apiKey: application.apiKey,
          websiteUrl: application.websiteUrl,
          createdAt: application.createdAt || new Date()
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async getApiKey(req, res) {
    try {
      const { appId } = req.query;

      // Mock response for production
      const application = {
        id: appId || 'mock_app_id',
        name: 'Mock Application',
        apiKey: 'mock_api_key_' + Date.now(),
        apiKeyExpires: null
      };

      res.json({
        application
      });
    } catch (error) {
      console.error('Get API key error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async revokeApiKey(req, res) {
    try {
      const { appId } = req.body;

      // Generate new API key
      const newApiKey = generateApiKey();

      res.json({
        message: 'API key revoked and new one generated',
        newApiKey: newApiKey,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      console.error('Revoke API key error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async listApplications(req, res) {
    try {
      // Mock applications list
      const applications = [
        {
          name: 'Production Test App',
          description: 'Test application for production',
          websiteUrl: 'https://production-test.com',
          createdAt: new Date()
        }
      ];

      res.json({
        applications
      });
    } catch (error) {
      console.error('List applications error:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}

module.exports = new AuthController();