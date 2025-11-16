const request = require('supertest');
const app = require('../src/app');
const AnalyticsEvent = require('../src/models/AnalyticsEvent');
const Application = require('../src/models/Application');
const User = require('../src/models/User');

describe('Analytics API', () => {
  let testApiKey;
  let testAppId;
  let testUserId;

  beforeAll(async () => {
    const user = new User({
      googleId: 'test_google_id',
      email: 'test@example.com',
      name: 'Test User'
    });
    await user.save();
    testUserId = user._id;

    const app = new Application({
      name: 'Test App',
      websiteUrl: 'https://test.com',
      apiKey: 'test_api_key_123',
      owner: testUserId
    });
    await app.save();
    testApiKey = app.apiKey;
    testAppId = app._id;
  });

  afterAll(async () => {
    await AnalyticsEvent.deleteMany({});
    await Application.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/analytics/collect', () => {
    it('should collect analytics event with valid API key', async () => {
      const eventData = {
        event: 'button_click',
        url: 'https://test.com/home',
        referrer: 'https://google.com',
        device: 'mobile',
        ipAddress: '192.168.1.1',
        userId: 'user123',
        sessionId: 'session123',
        metadata: {
          browser: 'Chrome',
          os: 'Android',
          screenSize: '1080x1920'
        }
      };

      const response = await request(app)
        .post('/api/analytics/collect')
        .set('x-api-key', testApiKey)
        .send(eventData)
        .expect(202);

      expect(response.body.message).toBe('Event collected successfully');
      expect(response.body.eventId).toBeDefined();
    });

    it('should reject event without API key', async () => {
      const response = await request(app)
        .post('/api/analytics/collect')
        .send({ event: 'test' })
        .expect(401);

      expect(response.body.error).toBe('API key is required');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});