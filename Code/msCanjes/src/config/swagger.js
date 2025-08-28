const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de gestión de agenda.',
            version: '1.0.0',
            description: 'Documentación de API para gestión de agenda del sistema AppleSales.'
        },
        servers: [
            {url: `http://localhost:${ process.env.PORT || 3004 }`},
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

const propiedadesCanje = {
  linea: {
    type: 'string',
    example: 'iPhone'
  },
  modelo: {
    type: 'string',
    example: '11 128GB'
  },
  bateriaMin: {
    type: 'number',
    example: .9
  },
  bateriaMax: {
    type: 'number',
    example: 1
  },
  precioCanje: {
    type: 'number',
    example: 220
  }
};

// Registrar canje
swaggerSpec.components.schemas.registrarCanje = {
  type: 'object',
  required: ['linea', 'modelo', 'bateriaMin', 'bateriaMax', 'precioCanje'],
  properties: propiedadesCanje
};

// Precio Canje
swaggerSpec.components.schemas.precioCanje = {
  type: 'object',
  required: [],
  properties: {
    _id: {
      type: 'string',
      example: '6893a2bb72cdb58a2bbd689e'
    },
    ...propiedadesCanje
  }
};

// Editar precio canje
swaggerSpec.components.schemas.editPrecioCanje = {
  type: 'object',
  required: ['precioCanje'],
  properties: {
    precioCanje: {
    type: 'number',
    example: 220
  }
  }
};

// PARAMETROS
// id de canje
swaggerSpec.components.parameters.CanjeIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID del precio de canje',
  schema: {
    type: 'string',
    example: '68978a6e530cf7c9ef53ebd6'
  }
};

swaggerSpec.components.parameters.LineaNombreParam = {
  name: 'linea',
  in: 'path',
  required: true,
  description: 'Nombre de la línea de productos',
  schema: {
    type: 'string',
    example: 'iPhone'
  }
};

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

