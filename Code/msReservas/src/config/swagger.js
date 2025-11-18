const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de gestión de reservas.',
            version: '1.0.0',
            description: 'Documentación de API para gestión de reservas del sistema AppleSales. Permite a los clientes reservar equipos con una seña del 20% y gestionar el ciclo completo de la reserva hasta la entrega del producto.'
        },
        servers: [
            {url: process.env.NODE_ENV === 'production' ? 'http://applesales.duckdns.org' : 'http://localhost:3007'},
        ],
    },
    apis: [path.join(__dirname, '../routes/*.js')],
};

let swaggerSpec = swaggerJsdoc(swaggerOptions);

// Add schema definition dynamically
swaggerSpec.components = swaggerSpec.components || {};
swaggerSpec.components.schemas = swaggerSpec.components.schemas || {};
swaggerSpec.components.responses = swaggerSpec.components.responses || {};
swaggerSpec.components.parameters = swaggerSpec.components.parameters || {};

// ============================================
// ESQUEMAS (SCHEMAS)
// ============================================

// Esquema de Cliente dentro de Reserva
swaggerSpec.components.schemas.ClienteReserva = {
  type: 'object',
  required: ['nombreUsuario', 'email', 'telefono'],
  properties: {
    nombreUsuario: {
      type: 'string',
      description: 'Nombre de usuario del cliente',
      example: 'cycclon'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Email del cliente',
      example: 'pedro.spidalieri@gmail.com'
    },
    telefono: {
      type: 'string',
      description: 'Teléfono de contacto del cliente',
      example: '3804280591'
    }
  }
};

// Esquema de Equipo
swaggerSpec.components.schemas.Equipo = {
  type: 'object',
  required: ['linea', 'modelo', 'color', 'condicion'],
  properties: {
    linea: {
      type: 'string',
      description: 'Línea del equipo (iPhone, iPad, MacBook, etc.)',
      example: 'iPhone'
    },
    modelo: {
      type: 'string',
      description: 'Modelo específico del equipo',
      example: '14 Pro Max'
    },
    color: {
      type: 'string',
      description: 'Color del equipo',
      example: 'Space Black'
    },
    condicion: {
      type: 'string',
      enum: ['Nuevo', 'Usado', 'Reacondicionado'],
      description: 'Condición del equipo',
      example: 'Nuevo'
    },
    bateria: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Estado de la batería (0 a 1, donde 1 es 100%)',
      example: 1
    }
  }
};

// Esquema de Seña
swaggerSpec.components.schemas.Sena = {
  type: 'object',
  required: ['monto', 'estado'],
  properties: {
    monto: {
      type: 'number',
      description: 'Monto de la seña (20% del precio del equipo)',
      example: 100000
    },
    estado: {
      type: 'string',
      enum: ['Solicitada', 'Pagada', 'Confirmada', 'Vencida'],
      description: 'Estado de la seña',
      example: 'Pagada'
    }
  }
};

// Esquema completo de Reserva
swaggerSpec.components.schemas.Reserva = {
  type: 'object',
  required: ['cliente', 'equipo', 'fecha', 'sucursal', 'sena', 'estado'],
  properties: {
    _id: {
      type: 'string',
      description: 'ID único de la reserva',
      example: '507f1f77bcf86cd799439011'
    },
    cliente: {
      $ref: '#/components/schemas/ClienteReserva'
    },
    equipo: {
      $ref: '#/components/schemas/Equipo'
    },
    fecha: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de creación de la reserva',
      example: '2025-11-14T15:30:00.000Z'
    },
    sucursal: {
      type: 'string',
      description: 'Sucursal donde se retirará el equipo',
      example: 'Centro'
    },
    sena: {
      $ref: '#/components/schemas/Sena'
    },
    estado: {
      type: 'string',
      enum: ['Solicitada', 'Confirmada', 'Completada', 'Cancelada', 'Vencida'],
      description: 'Estado de la reserva',
      example: 'Confirmada'
    }
  }
};

// ============================================
// PARÁMETROS (PARAMETERS)
// ============================================

swaggerSpec.components.parameters.ReservaIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID único de la reserva',
  schema: {
    type: 'string',
    example: '507f1f77bcf86cd799439011'
  }
};

// ============================================
// RESPUESTAS COMUNES (RESPONSES)
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
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email inválido'
                  }
                }
              }
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
            success: {
              type: 'boolean',
              example: false
            },
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
    description: 'Prohibido. No tienes permisos para realizar esta acción.',
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
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Reserva no encontrada'
            }
          }
        }
      }
    }
  },
  500: {
    description: 'Error interno del servidor',
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
              example: 'Error interno del servidor'
            }
          }
        }
      }
    }
  }
};

// ============================================
// SEGURIDAD (SECURITY SCHEMES)
// ============================================

swaggerSpec.components.securitySchemes = {
  bearerAuth: {
    type: 'http',
    in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Token JWT obtenido del microservicio de autenticación (msSeguridad)'
  }
};

module.exports = swaggerSpec;