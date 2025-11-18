const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const User = require('../models/user.model');

// Extract regex from schema
const usernameMatch = User.schema.path('username').options.match;
const passwordMatch = User.schema.path('password').options.match;
const usernameRegex = usernameMatch instanceof RegExp ? usernameMatch.source : usernameMatch[0].source;
const passwordRegex = passwordMatch instanceof RegExp ? passwordMatch.source : passwordMatch[0].source;
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
      { url: process.env.NODE_ENV === 'production' ? 'http://applesales.duckdns.org' : 'http://localhost:3002' },
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

// ============================================
// RESPONSES
// ============================================

swaggerSpec.components.responses = {
    400: {
        description: 'Datos incorrectos o faltantes',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Datos incorrectos o faltantes'
                        }
                    }
                }
            }
        }
    },
    401: {
        description: 'No autorizado. Token inválido o caducado.',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Token inválido o caducado'
                        }
                    }
                }
            }
        }
    },
    403: {
        description: 'Prohibido',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Prohibido'
                        }
                    }
                }
            }
        }
    },
    404: {
        description: 'No encontrado',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Recurso no encontrado'
                        }
                    }
                }
            }
        }
    }
};

// ============================================
// SECURITY SCHEMES
// ============================================

swaggerSpec.components.securitySchemes = {
    bearerAuth: {
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido del endpoint /auth/login'
    }
};

module.exports =  swaggerSpec;
