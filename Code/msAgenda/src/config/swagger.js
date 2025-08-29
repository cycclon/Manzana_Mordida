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

