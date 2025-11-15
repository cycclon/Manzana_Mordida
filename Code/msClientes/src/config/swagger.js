const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

// Extract regex from schema

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de microservicio de Clientes. App AppleSales',
      version: '1.0.0',
      description: 'Documentación de API del microservicio para gestión de clientes de la aplicación AppleSales.',
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3003}` },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};

let swaggerSpec = swaggerJsdoc(swaggerOptions);

// Ensure version field exists
swaggerSpec.openapi = swaggerSpec.openapi || '3.0.0';

// Add schema definitions
swaggerSpec.components = swaggerSpec.components || {};
swaggerSpec.components.schemas = swaggerSpec.components.schemas || {};
swaggerSpec.components.parameters = swaggerSpec.components.parameters || {};

// Propiedades editables
const clienteEditable = {
    email: {
      type: 'string',
      example: 'pedro.spidalieri@gmail.com'
    },
    whatsapp: {
      type: 'string',
      example: '3804280591'
    },
};

// Propiedades de cliente
const clienteProperties = {
    nombres: {
        type: 'string',
        example: 'Pedro Raul'
    },
    apellidos: {
      type: 'string',
      example: 'Spidalieri'
    },
    ...clienteEditable,
    usuario: {
      type: 'string',
      example: 'cycclon'
    }
};

// Cliente completo
swaggerSpec.components.schemas.cliente = {
  type: 'object',
  required: [],
  properties: {
    _id: {
      type: 'string',
      example: '6893a2bb72cdb58a2bbd689e'
    },
    ...clienteProperties,
  },  
};

// Nuevo cliente
swaggerSpec.components.schemas.nuevoCliente = {
  type: 'object',
  required: ['nombres', 'apellidos', 'email', 'usuario'],
  properties: clienteProperties
};

// Cliente editable
swaggerSpec.components.schemas.clienteEditado = {
  type: 'object',
  required: [],
  properties: clienteEditable
};

// PARAMETROS
// ID de equipo
swaggerSpec.components.parameters.ClienteIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID del cliente',
  schema: {
    type: 'string',
    example: '68978a6e530cf7c9ef53ebd6'
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

module.exports =  swaggerSpec;