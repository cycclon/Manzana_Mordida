const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const Cuenta = require('../schemas/cuenta.model');

const enumMonedas = Cuenta.schema.path('monedas').enumValues;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de gestión de cuentas bancarias.',
            version: '1.0.0',
            description: 'Documentación de API para gestión de cuentas bancarias del sistema AppleSales.'
        },
        servers: [
            {url: process.env.NODE_ENV === 'production' ? 'http://applesales.duckdns.org' : 'http://localhost:3009'},
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
// Esquema Nueva Cuenta Bancaria
swaggerSpec.components.schemas.nuevaCuenta = {
  type: 'object',
  required: ['entidad', 'cbu', 'alias', 'titular', 'monedas'],
  properties: {
    entidad: {
      type: 'string',
      description: 'Entidad bancaria o financiera proveedora de la cuenta.',
      example: 'BBVA'
    },
    cbu: {
      type: 'string',
      description: 'Identificador único de cuenta. (22 números)',
      example: "0720272088000037422422"
    },
    alias: {
      type: 'string',
      description: 'Alias de la cuenta.',
      example: 'brasil.poesia.bufalo'
    },
    titular: {
      type: 'string',
      description: 'Nombre completo del titular de la cuenta',
      example: 'Pedro Raúl Spidalieri'      
    },
    monedas: {
      type: 'array',
      description: 'Monedas que la cuenta permite recibir.',
      items: {
        type: 'string',
        enum: enumMonedas        
      },
      example: ['Pesos', 'Dólares']
    }
  }
};

swaggerSpec.components.schemas.cuentaEditada = {
  type: 'object',
  required: [],
  properties: {
    alias: {
      type: 'string',
      description: 'Alias de la cuenta.',
      example: 'brasil.poesia.bufalo'
    },
    monedas: {
      type: 'array',
      description: 'Monedas que la cuenta permite recibir.',
      items: {
        type: 'string',
        enum: enumMonedas        
      },
    example: ['Pesos', 'Dólares']
    }
  }
};

swaggerSpec.components.schemas.cuenta = {
  type: 'object',
  required: [],
  properties: {
    _id: {
        type: 'string',
        example: '68978a6e530cf7c9ef53ebd6'
    },
    entidad: {
      type: 'string',
      description: 'Entidad bancaria o financiera proveedora de la cuenta.',
      example: 'BBVA'
    },
    cbu: {
      type: 'string',
      description: 'Identificador único de cuenta. (22 números)',
      example: "0720272088000037422422"
    },
    alias: {
      type: 'string',
      description: 'Alias de la cuenta.',
      example: 'brasil.poesia.bufalo'
    },
    titular: {
      type: 'string',
      description: 'Nombre completo del titular de la cuenta',
      example: 'Pedro Raúl Spidalieri'      
    },
    monedas: {
      type: 'array',
      description: 'Monedas que la cuenta permite recibir.',
      items: {
        type: 'string',
        enum: enumMonedas        
      },
      example: ['Pesos', 'Dólares']
    }
  }
};

// PARAMETROS
swaggerSpec.components.parameters.CuentaIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID de la cuenta',
  schema: {
    type: 'string',
    example: '68978a6e530cf7c9ef53ebd6'
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

