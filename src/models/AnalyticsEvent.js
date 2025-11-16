const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    index: true
  },
  url: {
    type: String,
    required: true
  },
  referrer: {
    type: String
  },
  device: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet', 'other'],
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  metadata: {
    browser: String,
    os: String,
    screenSize: String,
    country: String,
    city: String,
    userAgent: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

analyticsEventSchema.index({ application: 1, event: 1, timestamp: 1 });
analyticsEventSchema.index({ userId: 1, timestamp: 1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);