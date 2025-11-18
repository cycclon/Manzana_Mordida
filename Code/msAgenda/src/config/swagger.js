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
            {url: process.env.NODE_ENV === 'production' ? 'http://applesales.duckdns.org' : 'http://localhost:3004'},
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
// Propiedades horario
const propiedadesHorario = {
  vendedor: {
    type: 'string',
    description: 'Nombre de un vendedor registrado',
    example: 'Pedro'
  },
  sucursal: {
    type: 'string',
    description: 'Dirección de la sucursal donde trabaja el vendedor',
    example: 'Rivadavia 967'
  },

  horaInicio: {
    type: 'number',
    description: 'Reloj de 24 horas',
    example: 12
  },
  horaFinal: {
    type: 'number',
    description: 'Reloj de 24 horas',
    example: 17
  }
};

// Propiedades cita anónima
const propiedadesCitaAnonima = {
  sucursal: {
    type: 'string',
    description: 'Dirección de la sucursal donde se llevará a cabo la cita.',
    example: "Rivadavia 967"
  },
  estado: {
    type: 'string',
    enum: ['Solicitada', 'Confirmada', 'Cancelada', 'Reprogramada'],
    example: "Confirmada"
  },
  fecha: {
    type: 'date',
    description: 'Fecha de la cita',
    example: '15/09/2025'
  },
  horaInicio: {
    type: 'number',
    description: 'Hora de inicio de la cita. (Reloj de 24h)',
    example: 15
  },
  duracion: {
    type: 'number',
    description: 'Cantidad de horas de duración de la cita',
    example: 2
  }
};

// Propiedades cita
const propiedadesCita = {
  cliente: {
    type: 'object',    
    description: 'Objeto cliente',
    required: ['nombre'],
    properties: {
      nombre: {
        type: 'string',
        description: 'Nombre completo del cliente',
        example: 'Pedro Spidalieri',
      },
      email: {
        type: 'string',
        description: 'Dirección de correo electrónico del cliente',
        example: 'pedro.spidalieri@gmail.com',
      },
      telefono: {
        type: 'string',
        description: 'Número de teléfono del cliente',
        example: '3804123456'
      },
      canje: {
        type: 'object',
        required: 'false',
        required: ['linea', 'modelo', 'bateria'],
        properties: {
          linea: {
            type: 'string',
            description: 'Líena de productos. Por defecto: iPhone',
            example: 'iPhone',
            default: 'iPhone',
            enum: ['iPhone', 'MacBook', 'iPad', 'AirPods', 'Watch']
          },
          modelo: {
             type: 'string',
            description: 'Modelo del producto',
            example: '13 Pro 128GB',
          },
          bateria: {
            type: 'number',
            description: 'Porcentaje de batería. Número entre 0 y 1',
            example: 0.9,
          }
        }
      }
    }
  },
  fecha: {
    type: 'date',
    description: 'Fecha de la cita',
    example: '15/09/2025',
  },
  horaInicio: {
    type: 'number',
    description: 'Hora de inicio de la cita (Reloj de 24h)',
    example: 15,
  },
  sucursal: {
    type: 'string',
    description: 'Dirección de la sucursal donde se lleva a cabo la cita.',
    example: 'Rivadavia 967',
  },  
};

swaggerSpec.components.schemas.citaAnonima = {
  type: 'object',
  required: [],
  properties: {
    _id: {
        type: 'string',
        example: '6895693be32485870f904cf5'
    },
    ...propiedadesCitaAnonima
  }
};

swaggerSpec.components.schemas.cita = {
  type: 'object',
  required: [],
  properties: {
    _id: {
        type: 'string',
        example: '6895693be32485870f904cf5'
    },
    ...propiedadesCita
  }
};

// Esquemea solicitar cita
swaggerSpec.components.schemas.solicitarCita = {
  type: 'object',
  required: ['cliente', 'fecha', 'horaInicio', 'sucursal'],
  properties: propiedadesCita
};

// Esquema reprogramar cita
swaggerSpec.components.schemas.reprogramarCita = {
  type: 'object',
  required: ['nuevaFecha', 'nuevaHora'],
  properties: {
    nuevaFecha: {
      type: 'date',
      description: 'Nueva fecha para la cita',
      example: '20/09/2025',
    },
    nuevaHora: {
      type: 'number',
      description: 'Nueva hora para la cita (reloj de 24h).',
      example: 17,
    }
  }
};

// Esquema cancelar cita
swaggerSpec.components.schemas.cancelarCita = {
  type: 'object',
  required: [],
  properties: {
    motivo: {
      type: 'string',
      description: 'Motivo de cancelación de la cita.',
      example: 'No podré asistir.'
    }
  }
};

// Esquema nuevo horario
swaggerSpec.components.schemas.nuevoHorario = {
  type: 'object',
  required: ['vendedor', 'sucursal', 'diaSemana', 'horaInicio', 'horaFinal'],
  properties: {
      diaSemana: {
        type: 'string',
        example: 'Lunes',
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
      },
    ...propiedadesHorario
  }
};

swaggerSpec.components.schemas.nuevosHorarios = {
  type: 'object',
  required: ['vendedor', 'sucursal', 'diasSemanas', 'horaInicio', 'horaFinal'],
  properties: {
      diasSemanas: {
        type: ['string'],
        example: ['Lunes', 'Martes'],
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        description: 'Listado de días de la semana.'
      },
    ...propiedadesHorario
  }
};

// PARAMETROS
// id Horario
swaggerSpec.components.parameters.HorarioIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID del horario',
  schema: {
    type: 'string',
    example: '68978a6e530cf7c9ef53ebd6'
  }
};

// id Cita
swaggerSpec.components.parameters.CitaIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID de la cita',
  schema: {
    type: 'string',
    example: '68978a6e530cf7c9ef53ebd6'
  }
};

// fecha cita
swaggerSpec.components.parameters.citaDia = {
  name: 'fecha',
  in: 'path',
  required: true,
  description: 'día de la cita',
  schema: {
    type: 'date',
    example: '15/09/2025'
  }
};

swaggerSpec.components.parameters.citaFechaDesde = {
  name: 'fechaDesde',
  in: 'path',
  required: true,
  description: 'Fecha inicial para en rango',
  schema: {
    type: 'date',
    example: '15/09/2025'
  }
};

swaggerSpec.components.parameters.citaFechaHasta = {
  name: 'fechaHasta',
  in: 'path',
  required: true,
  description: 'Fecha final para en rango',
  schema: {
    type: 'date',
    example: '25/09/2025'
  }
};

// sucursal cita
swaggerSpec.components.parameters.sucursalCita = {
  name: 'sucursal',
  in: 'path',
  required: true,
  description: 'Dirección de la sucursal para la cita',
  schema: {
    type: 'string',
    example: 'Rivadavia 967'
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

