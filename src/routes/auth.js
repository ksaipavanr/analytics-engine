const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateGoogle } = require('../middleware/googleAuth');
const { apiKeyLimit } = require('../middleware/rateLimit');

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Register a new application with Google OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - name
 *               - websiteUrl
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token
 *               name:
 *                 type: string
 *                 description: Application name
 *               websiteUrl:
 *                 type: string
 *                 description: Website URL
 *               description:
 *                 type: string
 *                 description: Application description
 *     responses:
 *       201:
 *         description: Application registered successfully
 *       400:
 *         description: Application already exists
 *       401:
 *         description: Invalid Google token
 */
router.post('/google', authenticateGoogle, authController.register);

/**
 * @swagger
 * /api/auth/api-key:
 *   get:
 *     summary: Get API key for a registered application
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: API key retrieved successfully
 *       404:
 *         description: Application not found
 */
router.get('/api-key', authenticateGoogle, apiKeyLimit, authController.getApiKey);

/**
 * @swagger
 * /api/auth/revoke:
 *   post:
 *     summary: Revoke and regenerate API key
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *             properties:
 *               appId:
 *                 type: string
 *                 description: Application ID
 *     responses:
 *       200:
 *         description: API key revoked and new one generated
 *       404:
 *         description: Application not found
 */
router.post('/revoke', authenticateGoogle, apiKeyLimit, authController.revokeApiKey);

/**
 * @swagger
 * /api/auth/applications:
 *   get:
 *     summary: List all applications for the user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: List of applications retrieved successfully
 */
router.get('/applications', authenticateGoogle, authController.listApplications);

module.exports = router;