const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Room Designer API',
      version: '1.0.0',
      description: 'API documentation for Room Designer',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API routes for documentation
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
