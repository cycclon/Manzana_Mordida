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
            {url: process.env.NODE_ENV === 'production' ? 'http://applesales.duckdns.org' : 'http://localhost:3006'},
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

module.exports = swaggerSpec;

