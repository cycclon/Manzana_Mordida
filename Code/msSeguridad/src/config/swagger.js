const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const User = require('../models/user.model');

// Extract regex from schema
const usernameRegex = User.schema.path('username').options.match.source;
const passwordRegex = User.schema.path('password').options.match.source;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Microservice API',
      version: '1.0.0',
      description: 'API documentation for authentication service',
    },
    servers: [
      { url: 'http://localhost:3002' },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

let swaggerSpec = swaggerJsdoc(swaggerOptions);

// Ensure version field exists
swaggerSpec.openapi = swaggerSpec.openapi || '3.0.0';

// Add schema definition for LoginRequest dynamically
swaggerSpec.components = swaggerSpec.components || {};
swaggerSpec.components.schemas = swaggerSpec.components.schemas || {};
swaggerSpec.components.schemas.LoginRequest = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
      example: 'johndoe',
      minLength: 4,
      pattern: usernameRegex,
      description: `Must be at least 4 characters, letters/numbers, and may include '.', '_' or '-'. Pattern: ${usernameRegex}`,
    },
    password: {
      type: 'string',
      example: 'Password123',
      minLength: 8,
      pattern: passwordRegex,
      description: `Must be at least 8 characters, include 1 uppercase letter and 1 number. Pattern: ${passwordRegex}`,
    },
  },
};

console.log(usernameRegex, passwordRegex);

module.exports =  swaggerSpec;