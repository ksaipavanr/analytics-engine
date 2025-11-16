const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const config = require('./config/env');

const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Unified Analytics Engine API',
      version: '1.0.0',
      description: 'API for collecting and analyzing web and mobile app events'
    },
    servers: [
      {
        url: config.baseUrl,
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Unified Analytics Engine API',
    version: '1.0.0',
    documentation: `${config.baseUrl}/api-docs`,
    health: `${config.baseUrl}/health`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

const initializeApp = async () => {
  try {
    await connectDB();
    await connectRedis();
    
    app.listen(config.port, () => {
      console.log(`🚀 Analytics Engine running on port ${config.port}`);
      console.log(`📚 API Docs: ${config.baseUrl}/api-docs`);
      console.log(`❤️  Health: ${config.baseUrl}/health`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    process.exit(1);
  }
};

initializeApp();

module.exports = app;