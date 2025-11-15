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

