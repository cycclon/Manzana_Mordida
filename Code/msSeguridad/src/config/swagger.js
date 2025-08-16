const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const User = require('../models/user.model');

// Extract regex from schema
const usernameRegex = User.schema.path('username').options.match.source;
const passwordRegex = User.schema.path('password').options.match.source;
const roleEnum = ['admin', 'sales'];
const usernameDescription = `Must be at least 4 characters, letters/numbers, and may include '.', '_' or '-'. Pattern: ${usernameRegex}`;
const passwordDescription = `Must be at least 8 characters, include 1 uppercase letter and 1 number. Pattern: ${passwordRegex}`;
const roleDescription = `Role of the staff member. Must be either "admin" or "Sales".`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Microservice API',
      version: '1.0.0',
      description: 'API documentation for the authentication microservice, for AppleSales app',
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

// Login route schema
swaggerSpec.components.schemas.LoginRequest = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
      example: 'johndoe',
      minLength: 4,
      pattern: usernameRegex,
      description: usernameDescription,
    },
    password: {
      type: 'string',
      example: 'Password123',
      minLength: 8,
      pattern: passwordRegex,
      description: passwordDescription,
    },
  },
};

// Register Staff route schema
swaggerSpec.components.schemas.StaffRequest = {
  type: 'object',
  required: ['username', 'password', 'role'],
  properties: {
    username: {
      type: 'string',
      example: 'johndoe',
      minLength: 4,
      pattern: usernameRegex,
      description: usernameDescription,
    },
    password: {
      type: 'string',
      example: 'Password123',
      minLength: 8,
      pattern: passwordRegex,
      description: passwordDescription,
    },
    role: {
      type: 'string',
      example: 'sales',      
      enum: roleEnum,
      description: roleDescription,
    }
  },
};

// JWT Bearer security Schema
swaggerSpec.components.securitySchemes = {
  bearerAuth: {
    type: 'http',
    in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  }
};

// Responses
swaggerSpec.components.responses = {
  400: {
    description: 'Missing token.',
    contents: 'application/json'
  },
  401: {
    description: 'Unauthorized. Invalid or expired token.',
    contents: 'application/json'
  },
  404: {
    description: 'Not Found',
    contents: 'application/json'
  }
};

module.exports =  swaggerSpec;