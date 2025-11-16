const crypto = require('crypto');

function generateApiKey() {
  return `ak_${crypto.randomBytes(32).toString('hex')}`;
}

module.exports = {
  generateApiKey
};