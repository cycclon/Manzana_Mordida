const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de gestión de reservas.',
            version: '1.0.0',
            description: 'Documentación de API para gestión de reservas del sistema AppleSales.'
        },
        servers: [
            {url: `http://localhost:${ process.env.PORT || 3007 }`},
        ],
    },
    apis: [path.join(__dirname, '../routes/*.js')],
};

let swaggerSpec = swaggerJsdoc(swaggerOptions);

// Add schema definition for LoginRequest dynamically
swaggerSpec.components = swaggerSpec.components || {};
swaggerSpec.components.schemas = swaggerSpec.components.schemas || {};
swaggerSpec.components.responses = swaggerSpec.components.responses || {};
swaggerSpec.components.parameters = swaggerSpec.components.parameters || {};

// PROPIEDADES Y ESQUEMAS

// PARAMETROS

// RESPUESTAS
swaggerSpec.components.responses = {
  400: {
    description: 'Datos incorrectos o faltantes',
    contents: 'application/json'
  },
  401: {
    description: 'No autorizado. Token inválido o caducado.',
    contents: 'application/json'
  },
  404: {
    description: 'No encontrado',
    contents: 'application/json'
  }
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

module.exports = swaggerSpec;

