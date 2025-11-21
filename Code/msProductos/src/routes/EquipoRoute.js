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
 *      summary: Listado de equipos
 *      tags: [Equipos]
 *      responses:
 *        "200":
 *          description: Listado de equipos registrados
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/equipo']          
 */
router.get('/', EquipoController.getEquipos);
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
router.post('/equipo/:id/imagenes', idValidator, upload.array('imagenes', 5), EquipoController.uploadImagenes);

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
router.delete('/equipo/:id/imagenes', idValidator, EquipoController.deleteImagen);

module.exports = router;