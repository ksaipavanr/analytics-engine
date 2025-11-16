const Application = require('../models/Application');
const { generateApiKey } = require('../utils/apiKeyGenerator');
const { redisClient } = require('../config/redis');

class AuthController {
  async register(req, res) {
    try {
      const { name, description, websiteUrl } = req.body;
      const user = req.user;

      const existingApp = await Application.findOne({
        name,
        owner: user._id
      });

      if (existingApp) {
        return res.status(400).json({
          error: 'Application with this name already exists'
        });
      }

      const apiKey = generateApiKey();

      const application = new Application({
        name,
        description,
        websiteUrl,
        apiKey,
        owner: user._id
      });

      await application.save();

      res.status(201).json({
        message: 'Application registered successfully',
        application: {
          id: application._id,
          name: application.name,
          apiKey: application.apiKey,
          websiteUrl: application.websiteUrl,
          createdAt: application.createdAt
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
      const user = req.user;
      const { appId } = req.query;

      const application = await Application.findOne({
        _id: appId,
        owner: user._id,
        isActive: true
      });

      if (!application) {
        return res.status(404).json({
          error: 'Application not found'
        });
      }

      res.json({
        application: {
          id: application._id,
          name: application.name,
          apiKey: application.apiKey,
          apiKeyExpires: application.apiKeyExpires
        }
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
      const user = req.user;
      const { appId } = req.body;

      const application = await Application.findOne({
        _id: appId,
        owner: user._id
      });

      if (!application) {
        return res.status(404).json({
          error: 'Application not found'
        });
      }

      await redisClient.del(`apiKey:${application.apiKey}`);

      application.apiKey = generateApiKey();
      application.apiKeyExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await application.save();

      res.json({
        message: 'API key revoked and new one generated',
        newApiKey: application.apiKey,
        expiresAt: application.apiKeyExpires
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
      const user = req.user;

      const applications = await Application.find({
        owner: user._id,
        isActive: true
      }).select('name description websiteUrl createdAt');

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