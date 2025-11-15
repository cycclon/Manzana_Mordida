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

module.exports = router;