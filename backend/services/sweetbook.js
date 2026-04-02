const { SweetbookClient } = require('bookprintapi-nodejs-sdk');

const client = new SweetbookClient({
  apiKey: process.env.SWEETBOOK_API_KEY,
  baseUrl: process.env.SWEETBOOK_API_BASE_URL,
});

module.exports = client;
