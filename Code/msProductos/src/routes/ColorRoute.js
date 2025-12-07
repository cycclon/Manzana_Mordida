/**
 * @swagger
 * tags:
 *  name: Colores
 *  description: Endpoints para gestión de colores
 */
const express = require('express');
const router = express.Router();
const ColorController = require('../controllers/ColorController');
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');

// PUBLIC ROUTES
/**
 * @swagger
 * /api/colores/:
 *   get:
 *      summary: Listado de colores
 *      tags: [Colores]
 *      responses:
 *        "200":
 *          description: Listado de colores registrados
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              _id:
 *                                  type: string
 *                              nombre:
 *                                  type: string
 *                              hex:
 *                                  type: string
 */
router.get('/', ColorController.getColores);

/**
 * @swagger
 * /api/colores/{id}:
 *   get:
 *      summary: Color por ID
 *      tags: [Colores]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: string
 *      responses:
 *        "200":
 *          description: Color
 *        "404":
 *          description: Color no encontrado
 */
router.get('/:id', ColorController.getColorId);

// PROTECTED ROUTES (ADMIN & SALES)
/**
 * @swagger
 * /api/colores/:
 *   post:
 *      summary: Crear nuevo color
 *      tags: [Colores]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Datos del color a crear
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                  - nombre
 *                  - hex
 *              properties:
 *                  nombre:
 *                      type: string
 *                      example: "Negro espacial"
 *                  hex:
 *                      type: string
 *                      example: "#000000"
 *      responses:
 *        "201":
 *          description: 'Color creado exitosamente'
 *        "400":
 *          description: 'Color ya existe'
 */
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    ColorController.addColor
);

/**
 * @swagger
 * /api/colores/{id}:
 *   put:
 *      summary: Editar color
 *      tags: [Colores]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: string
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Datos del color a actualizar
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                  nombre:
 *                      type: string
 *                  hex:
 *                      type: string
 *      responses:
 *        "200":
 *          description: 'Color actualizado exitosamente'
 *        "404":
 *          description: 'Color no encontrado'
 */
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    ColorController.editColor
);

/**
 * @swagger
 * /api/colores/{id}:
 *   delete:
 *      summary: Eliminar color
 *      tags: [Colores]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: string
 *      security:
 *       - bearerAuth: []
 *      responses:
 *        "200":
 *          description: 'Color eliminado exitosamente'
 *        "400":
 *          description: 'Color en uso, no se puede eliminar'
 *        "404":
 *          description: 'Color no encontrado'
 */
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    ColorController.deleteColor
);

module.exports = router;
