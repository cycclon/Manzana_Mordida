const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const Equipo = require('../schemas/EquipoSchema');
const Producto = require('../schemas/ProductoSchema');

const enumCondicion = Equipo.schema.path('condicion').enumValues;
const enumGrado = Equipo.schema.path('grado').enumValues;
const enumEstado = Equipo.schema.path('estado').enumValues;
const enumAccesorios = Equipo.schema.path('accesorios').enumValues;
const enumGarantia = Equipo.schema.path('garantiaPropia').enumValues;
const enumUbicacion = Equipo.schema.path('ubicacion').enumValues;
const enumLinea = Producto.schema.path('linea').enumValues;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de gestión de productos y equipos',
            version: '1.0.0',
            description: 'Documentación de API para gestión de productos y equipos del sistema AppleSales.'
        },
        servers: [
            {url: `http://localhost:${ process.env.PORT || 3001 }`},
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

// Propiedades Color
const colorProperties = {
    _id: {
        type: 'string',
        example: '6893a2bb72cdb58a2bbd689e'
    },
    nombre: {
        type: 'string',
        example: 'Natural Titanium'
    },
    hex: {
        type: 'string',
        example: '#fff444'
    }
};


// Esquema color
swaggerSpec.components.schemas.color = {
    type: 'object',
    required: ['nombre', 'hex'],
    properties: colorProperties
};

// Propiedades producto
const productoProperties = {
    marca: {
        type: 'string',
        example: 'Apple'
    },
    linea: {
        type: 'string',
        enum: enumLinea
    },
    modelo: {
        type: 'string',
        example: '16 Pro Max 256GB'
    },
    colores: {
        type: 'array',
        items: {
            type: 'object',
            example: colorProperties
        }
    }
}

// Esquema Producto
swaggerSpec.components.schemas.producto = {
    type: 'object',
    required: ['marca', 'linea', 'mnodelo', 'colores'],
    properties: {
        _id: {
            type: 'string',
            example: '6895693be32485870f904cf5'
        }, 
    ...productoProperties
    }
}

// Esquema equipo
swaggerSpec.components.schemas.equipo = {
    type: 'object',
    required: ['producto', 'condicion', 'estado', 'costo', 'precio', 'color', 'ubicacion'],
    properties: {
        _id: {
            type: 'string',
            example: '68978a6e530cf7c9ef53ebd6'
        },
        producto: {
            type: 'object',
            example: productoProperties
        },
        condicionBateria: {
            type: 'number',
            example: 1
        },
        condicion: {
            type: 'string',
            enum: enumCondicion
        },
        grado: {
            type: 'string',
            enum: enumGrado
        },
        estado: {
            type: 'string',
            enum: enumEstado
        },
        costo: {
            type: 'number',
            example: 1000
        },
        precio: {
            type: 'number',
            example: 1200
        },
        detalles: {
            type: 'array',
            items: {
                type: 'string',
                example: "Raya en pantalla"
            }
        },
        accesorios: {
            type: 'string',
            enum: enumAccesorios
        },
        color: {
            type: 'object',
            example: colorProperties
        },
        garantiaApple: {
            type: 'date',
            example: '04/05/2026'
        },
        garantiaPropia: {
            type: 'string',
            enum: enumGarantia
        },
        ubicacion: {
            type: 'string',
            enum: enumUbicacion
        },
        canjeable: {
            type: 'boolean',
            example: 'true'
        }
    }
};

// Esquema nuevoEquipo
swaggerSpec.components.schemas.nuevoEquipo = {
    type: 'object',
    required: ['producto', 'condicion', 'estado', 'costo', 'precio', 'color', 'ubicacion', 'canjeable'],
    properties: {
        producto: {
            type: 'string',
            example: '6895693be32485870f904cf5',
            description: 'ID de producto usado como base para registrar el equipo.'
        },
        condicionBateria: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            example: 1,
            description: 'Condición de batería expresada en un valor numérico entre 0 y 1, siendo 1=100%.'
        },
        condicion: {
            type: 'string',
            enum: enumCondicion
        },
        grado: {
            type: 'string',
            enum: enumGrado
        },
        estado: {
            type: 'string',
            enum: enumEstado
        },
        costo: {
            type: 'number',
            example: 1000,
            description: 'Valor expresado en dólares que indica el costo al cual se obtuvo el equipo. (Incluir costos de logística, reparaciones, etc).'
        },
        precio: {
            type: 'number',
            example: 1200,
            description: 'Valor expresado en dólares que indica el precio al cual se venderá el equipo al por menor.'
        },
        detalles: {
            type: 'array',
            items: {
                type: 'string',
                example: "Raya en pantalla"
            },
            description: 'Listado de detalles estéticos o funcionales relevantes.'
        },
        accesorios: {
            type: 'array',
            items: {
                type: 'string',
                example: "Caja",                
            },         
            description: 'Listado de accesorios incluidos con el equipo.'
        },
        color: {
            type: 'string',
            example: 'Natural Titanium',
            description: 'Nombre del color del equipo. Debe coincidir con un color registrado en la base de datos.'
        },
        garantiaApple: {
            type: 'date',
            example: '04/05/2026',
            description: 'Si el equipoa aún posee garantía de fábrica, completar este campo.'
        },
        garantiaPropia: {
            type: 'string',
            enum: enumGarantia,
            description: 'Si el equipoa ya no posee garantía de fábrica, completar este campo.'
        },
        ubicacion: {
            type: 'string',
            enum: enumUbicacion,
            description: 'Aclarar la ubicaición (sucursal) donde se encuentra el equipo actualmente.'
        },
        canjeable: {
            type: 'boolean',
            example: 'true',
            description: 'Determina si un equipo es elegible para plan canje.'
        }
    }
};

// Esquema equipoEditado
swaggerSpec.components.schemas.equipoEditado = {
    type: 'object',
    required: [],
    properties: {
        condicionBateria: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            example: 1,
            description: 'Condición de batería expresada en un valor numérico entre 0 y 1, siendo 1=100%.'
        },
        grado: {
            type: 'string',
            enum: enumGrado
        },
        estado: {
            type: 'string',
            enum: enumEstado
        },
        costo: {
            type: 'number',
            example: 1000,
            description: 'Valor expresado en dólares que indica el costo al cual se obtuvo el equipo. (Incluir costos de logística, reparaciones, etc).'
        },
        precio: {
            type: 'number',
            example: 1200,
            description: 'Valor expresado en dólares que indica el precio al cual se venderá el equipo al por menor.'
        },
        detalles: {
            type: 'array',
            items: {
                type: 'string',
                example: "Raya en pantalla"
            },
            description: 'Listado de detalles estéticos o funcionales relevantes.'
        },
        accesorios: {
            type: 'array',
            items: {
                type: 'string',
                example: "Caja",                
            },         
            description: 'Listado de accesorios incluidos con el equipo.'
        },
        color: {
            type: 'string',
            example: 'Natural Titanium',
            description: 'Nombre del color del equipo. Debe coincidir con un color registrado en la base de datos.'
        },
        garantiaApple: {
            type: 'date',
            example: '04/05/2026',
            description: 'Si el equipoa aún posee garantía de fábrica, completar este campo.'
        },
        garantiaPropia: {
            type: 'string',
            enum: enumGarantia,
            description: 'Si el equipoa ya no posee garantía de fábrica, completar este campo.'
        },
        ubicacion: {
            type: 'string',
            enum: enumUbicacion,
            description: 'Aclarar la ubicaición (sucursal) donde se encuentra el equipo actualmente.'
        },
        canjeable: {
            type: 'boolean',
            example: 'true',
            description: 'Determina si un equipo es elegible para plan canje.'
        }
    }
};

// PARAMETROS
// ID de equipo
swaggerSpec.components.parameters.EquipoIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID del equipo',
  schema: {
    type: 'string',
    example: '68978a6e530cf7c9ef53ebd6'
  }
};

// ID de producto
swaggerSpec.components.parameters.ProductoIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID del producto',
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

module.exports = swaggerSpec;

