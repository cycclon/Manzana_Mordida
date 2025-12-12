const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de gestión de CRM',
            version: '1.0.0',
            description: 'Documentación de API para gestión de CRM del sistema AppleSales. Permite al administrador o al equipo de ventas hacer un seguimiento de cada cliente/lead.'
        },
        servers: [
            {url: process.env.NODE_ENV === 'production' ? 'http://applesales.duckdns.org' : 'http://localhost:3008'},
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

// Esquema CRM
swaggerSpec.components.schemas.CRM = {
  type: 'object',
  required: ['usuario', 'redSocial'],
  properties: {
    _id: {
      type: 'string',
      description: 'ID único del registro CRM',
      example: '507f1f77bcf86cd799439011'
    },
    usuario: {
      type: 'string',
      description: 'Nombre de usuario o handle del cliente en la red social',
      example: 'juanperez_ok'
    },
    redSocial: {
      type: 'string',
      description: 'Red social de origen del contacto',
      enum: ['Instagram', 'Facebook', 'WhatsApp', 'Teléfono', 'Email', 'Presencial', 'Web', 'Otro'],
      example: 'Instagram'
    },
    idRedSocial: {
      type: 'string',
      description: 'ID interno de la red social (opcional)',
      example: '123456789'
    },
    nombres: {
      type: 'string',
      description: 'Nombres del cliente',
      example: 'Juan Carlos'
    },
    apellidos: {
      type: 'string',
      description: 'Apellidos del cliente',
      example: 'Pérez García'
    },
    telefono: {
      type: 'string',
      description: 'Teléfono de contacto',
      example: '+54 11 1234-5678'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Email del cliente',
      example: 'juan.perez@email.com'
    },
    estado: {
      type: 'string',
      description: 'Estado actual del lead en el embudo de ventas',
      enum: ['Nuevo lead', 'Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
      example: 'Interesado'
    },
    historialEstados: {
      type: 'array',
      description: 'Historial de cambios de estado',
      items: {
        type: 'object',
        properties: {
          estado: {
            type: 'string',
            enum: ['Nuevo lead', 'Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido']
          },
          fecha: {
            type: 'string',
            format: 'date-time'
          },
          notas: {
            type: 'string'
          }
        }
      }
    },
    intereses: {
      type: 'string',
      description: 'Productos o servicios de interés del cliente',
      example: 'iPhone 15 Pro Max 256GB, AirPods Pro'
    },
    equipoComprado: {
      type: 'string',
      description: 'ID del equipo comprado (referencia a colección Equipo)',
      example: '507f1f77bcf86cd799439012'
    },
    equipoCompradoDescripcion: {
      type: 'string',
      description: 'Descripción del equipo comprado',
      example: 'iPhone 15 Pro Max 256GB Negro'
    },
    requiereHumano: {
      type: 'boolean',
      description: 'Indica si el lead requiere atención humana (no puede ser manejado por bot)',
      example: false
    },
    notas: {
      type: 'string',
      description: 'Notas adicionales sobre el cliente',
      example: 'Cliente interesado en financiación'
    },
    fechaUltimoContacto: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha del último contacto con el cliente'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de creación del registro'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de última actualización del registro'
    }
  }
};

// Esquema para crear CRM
swaggerSpec.components.schemas.CRMCreate = {
  type: 'object',
  required: ['usuario', 'redSocial'],
  properties: {
    usuario: {
      type: 'string',
      description: 'Nombre de usuario o handle del cliente',
      example: 'juanperez_ok'
    },
    redSocial: {
      type: 'string',
      description: 'Red social de origen',
      enum: ['Instagram', 'Facebook', 'WhatsApp', 'Teléfono', 'Email', 'Presencial', 'Web', 'Otro'],
      example: 'Instagram'
    },
    idRedSocial: {
      type: 'string',
      description: 'ID interno de la red social',
      example: '123456789'
    },
    nombres: {
      type: 'string',
      example: 'Juan Carlos'
    },
    apellidos: {
      type: 'string',
      example: 'Pérez García'
    },
    telefono: {
      type: 'string',
      example: '+54 11 1234-5678'
    },
    email: {
      type: 'string',
      format: 'email',
      example: 'juan.perez@email.com'
    },
    intereses: {
      type: 'string',
      example: 'iPhone 15 Pro Max'
    },
    notas: {
      type: 'string',
      example: 'Cliente referido por otro cliente'
    }
  }
};

// Esquema para actualizar CRM
swaggerSpec.components.schemas.CRMUpdate = {
  type: 'object',
  properties: {
    nombres: {
      type: 'string',
      example: 'Juan Carlos'
    },
    apellidos: {
      type: 'string',
      example: 'Pérez García'
    },
    telefono: {
      type: 'string',
      example: '+54 11 1234-5678'
    },
    email: {
      type: 'string',
      format: 'email',
      example: 'juan.perez@email.com'
    },
    intereses: {
      type: 'string',
      example: 'iPhone 15 Pro Max, MacBook Air'
    },
    notas: {
      type: 'string',
      example: 'Notas actualizadas'
    },
    equipoComprado: {
      type: 'string',
      example: '507f1f77bcf86cd799439012'
    },
    equipoCompradoDescripcion: {
      type: 'string',
      example: 'iPhone 15 Pro Max 256GB Negro'
    }
  }
};

// Esquema para cambio de estado
swaggerSpec.components.schemas.CambioEstado = {
  type: 'object',
  properties: {
    notas: {
      type: 'string',
      description: 'Notas sobre el cambio de estado',
      example: 'Cliente confirmó interés en el producto'
    }
  }
};

// Esquema para cambio de estado múltiple
swaggerSpec.components.schemas.CambioEstadoMultiple = {
  type: 'object',
  required: ['ids', 'nuevoEstado'],
  properties: {
    ids: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'Array de IDs de CRM a actualizar',
      example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
    },
    nuevoEstado: {
      type: 'string',
      description: 'Nuevo estado a asignar',
      enum: ['Nuevo lead', 'Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
      example: 'Lead frío'
    },
    notas: {
      type: 'string',
      description: 'Notas sobre el cambio de estado',
      example: 'Cambio masivo por inactividad'
    }
  }
};

// Esquema para toggle requiereHumano
swaggerSpec.components.schemas.ToggleRequiereHumano = {
  type: 'object',
  required: ['requiereHumano'],
  properties: {
    requiereHumano: {
      type: 'boolean',
      description: 'Nuevo valor para la bandera requiereHumano',
      example: true
    }
  }
};

// Esquema para opciones (dropdown)
swaggerSpec.components.schemas.Opciones = {
  type: 'object',
  properties: {
    estados: {
      type: 'array',
      items: {
        type: 'string'
      },
      example: ['Nuevo lead', 'Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido']
    },
    redesSociales: {
      type: 'array',
      items: {
        type: 'string'
      },
      example: ['Instagram', 'Facebook', 'WhatsApp', 'Teléfono', 'Email', 'Presencial', 'Web', 'Otro']
    }
  }
};

// Esquema para estadísticas
swaggerSpec.components.schemas.Estadisticas = {
  type: 'object',
  properties: {
    total: {
      type: 'integer',
      description: 'Total de leads',
      example: 150
    },
    porEstado: {
      type: 'object',
      description: 'Cantidad de leads por estado',
      additionalProperties: {
        type: 'integer'
      },
      example: {
        'Nuevo lead': 25,
        'Interesado': 40,
        'En evaluación': 30,
        'Negociación/Cierre': 15,
        'Venta concretada/Postventa': 20,
        'Lead frío': 15,
        'Perdido': 5
      }
    },
    porRedSocial: {
      type: 'object',
      description: 'Cantidad de leads por red social',
      additionalProperties: {
        type: 'integer'
      },
      example: {
        'Instagram': 80,
        'WhatsApp': 40,
        'Facebook': 20,
        'Teléfono': 10
      }
    },
    requierenHumano: {
      type: 'integer',
      description: 'Cantidad de leads que requieren atención humana',
      example: 12
    }
  }
};

// Esquema para respuesta paginada
swaggerSpec.components.schemas.CRMPaginatedResponse = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: '#/components/schemas/CRM'
      }
    },
    total: {
      type: 'integer',
      description: 'Total de registros',
      example: 150
    },
    page: {
      type: 'integer',
      description: 'Página actual',
      example: 1
    },
    limit: {
      type: 'integer',
      description: 'Registros por página',
      example: 25
    },
    totalPages: {
      type: 'integer',
      description: 'Total de páginas',
      example: 6
    }
  }
};

// ============================================
// PARÁMETROS (PARAMETERS)
// ============================================

swaggerSpec.components.parameters.CRMIdParam = {
  name: 'idcrm',
  in: 'path',
  required: true,
  description: 'ID único del registro CRM',
  schema: {
    type: 'string',
    example: '507f1f77bcf86cd799439011'
  }
};

swaggerSpec.components.parameters.UsuarioParam = {
  name: 'usuario',
  in: 'path',
  required: true,
  description: 'Nombre de usuario a buscar',
  schema: {
    type: 'string',
    example: 'juanperez_ok'
  }
};

swaggerSpec.components.parameters.EstadoParam = {
  name: 'estado',
  in: 'path',
  required: true,
  description: 'Estado del CRM a filtrar',
  schema: {
    type: 'string',
    enum: ['Nuevo lead', 'Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
    example: 'Interesado'
  }
};

swaggerSpec.components.parameters.NuevoEstadoParam = {
  name: 'nuevoestado',
  in: 'path',
  required: true,
  description: 'Nuevo estado a asignar',
  schema: {
    type: 'string',
    enum: ['Nuevo lead', 'Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
    example: 'En evaluación'
  }
};

swaggerSpec.components.parameters.PageParam = {
  name: 'page',
  in: 'query',
  required: false,
  description: 'Número de página',
  schema: {
    type: 'integer',
    minimum: 1,
    default: 1,
    example: 1
  }
};

swaggerSpec.components.parameters.LimitParam = {
  name: 'limit',
  in: 'query',
  required: false,
  description: 'Cantidad de registros por página',
  schema: {
    type: 'integer',
    minimum: 1,
    maximum: 100,
    default: 25,
    example: 25
  }
};

swaggerSpec.components.parameters.SortByParam = {
  name: 'sortBy',
  in: 'query',
  required: false,
  description: 'Campo por el cual ordenar',
  schema: {
    type: 'string',
    enum: ['usuario', 'estado', 'redSocial', 'fechaUltimoContacto', 'createdAt'],
    default: 'fechaUltimoContacto',
    example: 'fechaUltimoContacto'
  }
};

swaggerSpec.components.parameters.SortOrderParam = {
  name: 'sortOrder',
  in: 'query',
  required: false,
  description: 'Orden de clasificación',
  schema: {
    type: 'string',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc'
  }
};

swaggerSpec.components.parameters.FilterUsuarioParam = {
  name: 'usuario',
  in: 'query',
  required: false,
  description: 'Filtrar por nombre de usuario (búsqueda parcial)',
  schema: {
    type: 'string',
    example: 'juan'
  }
};

swaggerSpec.components.parameters.FilterEstadoParam = {
  name: 'estado',
  in: 'query',
  required: false,
  description: 'Filtrar por estado',
  schema: {
    type: 'string',
    enum: ['Nuevo lead', 'Interesado', 'En evaluación', 'Negociación/Cierre', 'Venta concretada/Postventa', 'Lead frío', 'Perdido'],
    example: 'Interesado'
  }
};

swaggerSpec.components.parameters.FilterRedSocialParam = {
  name: 'redSocial',
  in: 'query',
  required: false,
  description: 'Filtrar por red social',
  schema: {
    type: 'string',
    enum: ['Instagram', 'Facebook', 'WhatsApp', 'Teléfono', 'Email', 'Presencial', 'Web', 'Otro'],
    example: 'Instagram'
  }
};

swaggerSpec.components.parameters.FilterRequiereHumanoParam = {
  name: 'requiereHumano',
  in: 'query',
  required: false,
  description: 'Filtrar por bandera requiereHumano',
  schema: {
    type: 'boolean',
    example: true
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
                    example: 'usuario'
                  },
                  message: {
                    type: 'string',
                    example: 'El usuario es requerido'
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
              example: 'Prohibido. Rol insuficiente.'
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
              example: 'CRM no encontrado'
            }
          }
        }
      }
    }
  },
  409: {
    description: 'Conflicto - El registro ya existe',
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
              example: 'Ya existe un registro CRM para este usuario en esta red social'
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
