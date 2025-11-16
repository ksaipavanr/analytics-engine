const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const analyticsCollectLimit = createRateLimit(
  15 * 60 * 1000,
  1000,
  'Too many analytics events from this IP, please try again later.'
);

const apiKeyLimit = createRateLimit(
  15 * 60 * 1000,
  100,
  'Too many API key requests, please try again later.'
);

const analyticsQueryLimit = createRateLimit(
  15 * 60 * 1000,
  300,
  'Too many analytics queries, please try again later.'
);

module.exports = {
  analyticsCollectLimit,
  apiKeyLimit,
  analyticsQueryLimit
};