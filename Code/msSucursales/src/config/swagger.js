const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Microservicio de gestión de sucursales.',
            version: '1.0.0',
            description: 'Documentación de API para gestión de sucursales del sistema AppleSales.'
        },
        servers: [
            {url: `http://localhost:${ process.env.PORT || 3005 }`},
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

const propiedadesDireccion = {
  calle: {
    type: 'string',
    example: 'Av. Rivadavia'
  },
  altura: {
    type: 'number',
    example: 967
  },
  piso: {
    type: 'string',
    example: '7'
  },
  departamento: {
    type: 'string',
    example: 'B'
  },
  entreCalles: {
    type: 'array',
    items: ['string'],
    example: ['Av. Perón', 'Copiapó']
  },
  referencias: {
    type: 'array',
    items: ['string'],
    example: ['Frente a Natividad']
  }
};

// PROPIEDADES Y ESQUEMAS
const propiedadesSucursal = {
  provincia: {
    type: 'string',
    example: 'La Rioja'
  },
  localidad: {
    type: 'string',
    example: 'Capital'
  },
  direccion: {
    type: 'object',
    properties: propiedadesDireccion    
  },
  googleMaps: {
    type: 'string',
    example: 'https://maps.app.goo.gl/YAPCoM9cDvmE5fq4A'
  }
};

swaggerSpec.components.schemas.sucursal = {
  type: 'object',
  required: [],
  properties: {
    _id: {
      type: 'string',
      example: '6893a2bb72cdb58a2bbd689e'
    },
    ...propiedadesSucursal
  }
};

swaggerSpec.components.schemas.editSucursal = {
  type: 'object',
  required: [],
  properties: propiedadesSucursal  
};

swaggerSpec.components.schemas.nuevaSucursal = {
  type: 'object',
  required: ['provincia', 'localidad', 'direccion', 'barrio'],
  properties: propiedadesSucursal
};

// PARAMETROS
// id Sucursal
swaggerSpec.components.parameters.SucursalIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'ID de la sucursal',
  schema: {
    type: 'string',
    example: '68978a6e530cf7c9ef53ebd6'
  }
};

// Nombre localidad
swaggerSpec.components.parameters.ProvinciaLocalidadParam = {
  name: 'prov-loc',
  in: 'path',
  required: true,
  description: 'Nombre de la provincia y nombre de la localidad',
  schema: {
    type: 'string',
    example: 'La Rioja-Capital'
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

