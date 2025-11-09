// Vercel serverless function handler
const app = require('../server');

// Export the Express app for Vercel
// Database connection is ensured via ensureDB middleware
module.exports = app;

