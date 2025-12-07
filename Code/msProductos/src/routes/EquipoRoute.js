/**
 * @swagger
 * tags:
 *  name: Equipos
 *  description: Endpoints para gestión de equipos
 */
const express = require('express');
const router = express.Router();
const EquipoController = require('../controllers/EquipoController');
const idValidator = require('../middleware/EquipoIdValidator');
const {authMiddleware, roleMiddleware} = require('../middleware/securityHandler');
const multer = require('multer');

// PUBLICO
/**
 * @swagger
 * /api/equipos/:
 *   get:
 *      summary: Listado de equipos con filtros opcionales
 *      description: Obtiene una lista de equipos. Soporta múltiples filtros para búsqueda y filtrado avanzado
 *      tags: [Equipos]
 *      parameters:
 *        - in: query
 *          name: search
 *          schema:
 *            type: string
 *          description: Buscar por modelo, marca o línea del producto (ej. "iPhone", "MacBook")
 *          example: iPhone
 *        - in: query
 *          name: condition
 *          schema:
 *            type: string
 *            enum: [Nuevo, Usado, Reacondicionado]
 *          description: Filtrar por condición del equipo
 *          example: Usado
 *        - in: query
 *          name: estado
 *          schema:
 *            type: string
 *            enum: [Disponible, Reservado, Vendido]
 *          description: Filtrar por estado del equipo
 *          example: Disponible
 *        - in: query
 *          name: grado
 *          schema:
 *            type: string
 *            enum: [A+, A, A-, Sealed, OEM]
 *          description: Filtrar por grado del equipo
 *          example: A+
 *        - in: query
 *          name: minPrice
 *          schema:
 *            type: number
 *            format: float
 *          description: Precio mínimo en USD
 *          example: 500
 *        - in: query
 *          name: maxPrice
 *          schema:
 *            type: number
 *            format: float
 *          description: Precio máximo en USD
 *          example: 2000
 *        - in: query
 *          name: minBatteryHealth
 *          schema:
 *            type: number
 *            format: float
 *            minimum: 0
 *            maximum: 100
 *          description: Salud mínima de batería en porcentaje (0-100)
 *          example: 80
 *        - in: query
 *          name: canjeable
 *          schema:
 *            type: boolean
 *          description: Filtrar equipos canjeables
 *          example: true
 *      responses:
 *        "200":
 *          description: Listado de equipos registrados (filtrado según parámetros)
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/equipo']
 */
router.get('/', EquipoController.getEquipos);

/**
 * @swagger
 * /api/equipos/detalles:
 *   get:
 *      summary: Obtener todos los detalles únicos
 *      description: Devuelve una lista de todos los detalles únicos usados en dispositivos (para autocomplete)
 *      tags: [Equipos]
 *      responses:
 *        "200":
 *          description: Lista de detalles únicos
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                        type: string
 *                      example: ["Rayón en pantalla", "Línea fina en marco", "Sin detalles"]
 */
router.get('/detalles', EquipoController.getAllDetalles);

/**
 * @swagger
 * /api/equipos/{id}:
 *   get:
 *      summary: Equipo por ID
 *      tags: [Equipos]
 *      parameters:
 *        - $ref: '#/components/parameters/EquipoIdParam'
 *      responses:
 *        "200":
 *          description: Objeto equipo
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/equipo'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.get('/equipo/:id', idValidator, EquipoController.getEquipoID);

// JWT ADMIN O SALES
/**
 * @swagger
 * /api/equipos/crear-equipo:
 *   post:
 *      summary: Registrar equipo
 *      description: Registra un nuevo equipo a partir de un producto base previamente registrado
 *      tags: [Equipos]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Objeto a insertar en la base de datos
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/nuevoEquipo'
 *      responses:
 *        "201":
 *          description: 'Equipo registrado correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.post('/crear-equipo', authMiddleware, roleMiddleware(['admin', 'sales']), EquipoController.addEquipo);
/**
 * @swagger
 * /api/equipos/equipo/{idEquipo}:
 *   put:
 *      summary: Editar equipo
 *      tags: [Equipos]
 *      parameters:
 *        - $ref: '#/components/parameters/EquipoIdParam'
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Campos editados
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/equipoEditado'
 *      responses:
 *        "201":
 *          description: 'Equipo editado correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.put('/equipo/:id', authMiddleware, roleMiddleware(['admin', 'sales']), idValidator, EquipoController.editEquipo);
/**
 * @swagger
 * /api/equipos/equipo/{idEquipo}:
 *   delete:
 *      summary: Eliminar equipo
 *      tags: [Equipos]
 *      parameters:
 *        - $ref: '#/components/parameters/EquipoIdParam'
 *      security:
 *       - bearerAuth: []
 *      responses:
 *        "201":
 *          description: 'Equipo eliminado correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.delete('/equipo/:id', authMiddleware, roleMiddleware(['admin', 'sales']), idValidator, EquipoController.deleteEquipo);

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, //5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);            
        } else {
            cb(new Error('Solo se permiten im[agenes'));
        }
    },
});

/**
 * @swagger
 * /api/equipos/equipo/{id}/imagenes:
 *   post:
 *      summary: Subir imágenes de un equipo
 *      description: Permite subir hasta 5 imágenes para un equipo específico
 *      tags: [Equipos]
 *      parameters:
 *        - $ref: '#/components/parameters/EquipoIdParam'
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                imagenes:
 *                  type: array
 *                  items:
 *                    type: string
 *                    format: binary
 *                  maxItems: 5
 *                  description: Hasta 5 imágenes (máximo 5MB cada una)
 *      responses:
 *        "200":
 *          description: 'Imágenes subidas exitosamente'
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'Imágenes subidas exitosamente'
 *                  imagenes:
 *                    type: array
 *                    items:
 *                      type: string
 *                      example: 'https://pub-xxx.r2.dev/equipos/uuid.jpg'
 *        "400":
 *          description: 'Máximo de imágenes excedido o formato inválido'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.post('/equipo/:id/imagenes', authMiddleware, roleMiddleware(['admin', 'sales']), idValidator, upload.array('imagenes', 5), EquipoController.uploadImagenes);

/**
 * @swagger
 * /api/equipos/equipo/{id}/imagenes:
 *   delete:
 *      summary: Eliminar una imagen de un equipo
 *      description: Elimina una imagen específica del equipo
 *      tags: [Equipos]
 *      parameters:
 *        - $ref: '#/components/parameters/EquipoIdParam'
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - imageUrl
 *              properties:
 *                imageUrl:
 *                  type: string
 *                  example: 'https://pub-xxx.r2.dev/equipos/uuid.jpg'
 *                  description: URL completa de la imagen a eliminar
 *      responses:
 *        "200":
 *          description: 'Imagen eliminada exitosamente'
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: 'Imagen eliminada exitosamente'
 *                  imagenes:
 *                    type: array
 *                    items:
 *                      type: string
 *        "400":
 *          description: 'imageUrl requerido'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.delete('/equipo/:id/imagenes', authMiddleware, roleMiddleware(['admin', 'sales']), idValidator, EquipoController.deleteImagen);

module.exports = router;