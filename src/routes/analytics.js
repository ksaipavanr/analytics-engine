const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateApiKey } = require('../middleware/auth');
const { authenticateGoogle } = require('../middleware/googleAuth');
const {
  analyticsCollectLimit,
  analyticsQueryLimit
} = require('../middleware/rateLimit');

/**
 * @swagger
 * /api/analytics/collect:
 *   post:
 *     summary: Collect analytics event
 *     tags: [Analytics]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event
 *               - url
 *               - ipAddress
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event name (e.g., button_click, page_view)
 *               url:
 *                 type: string
 *                 description: Page URL where event occurred
 *               referrer:
 *                 type: string
 *                 description: Referrer URL
 *               device:
 *                 type: string
 *                 enum: [mobile, desktop, tablet, other]
 *                 description: Device type
 *               ipAddress:
 *                 type: string
 *                 description: User IP address
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Event timestamp
 *               userId:
 *                 type: string
 *                 description: User identifier
 *               sessionId:
 *                 type: string
 *                 description: Session identifier
 *               metadata:
 *                 type: object
 *                 properties:
 *                   browser:
 *                     type: string
 *                   os:
 *                     type: string
 *                   screenSize:
 *                     type: string
 *                   userAgent:
 *                     type: string
 *     responses:
 *       202:
 *         description: Event collected successfully
 *       401:
 *         description: Invalid API key
 */
router.post(
  '/collect',
  authenticateApiKey,
  analyticsCollectLimit,
  analyticsController.collectEvent
);

/**
 * @swagger
 * /api/analytics/event-summary:
 *   get:
 *     summary: Get event summary analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: string
 *         description: Event name to filter by
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *         description: Specific application ID to filter by
 *     responses:
 *       200:
 *         description: Event summary retrieved successfully
 *       400:
 *         description: Invalid parameters
 */
router.get(
  '/event-summary',
  authenticateGoogle,
  analyticsQueryLimit,
  analyticsController.getEventSummary
);

/**
 * @swagger
 * /api/analytics/user-stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get stats for
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 *       404:
 *         description: No events found for this user
 */
router.get(
  '/user-stats',
  authenticateGoogle,
  analyticsQueryLimit,
  analyticsController.getUserStats
);

module.exports = router;