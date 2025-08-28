/**
 * @swagger
 * tags:
 *  name: Canjes
 *  description: Endpoints de gestión de precios de canje
 */
const express = require('express');
const router = new express.Router();
// MIDDLEWARE
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
const { detectarSuperposicionSimple } = require('../middleware/precioCanje.middleware');
// CONTROLLERS
const { 
    getPreciosCanjes, 
    getLineas,
    getModelos,
    addPrecioCanje,
    deletePrecioCanje,
    editPrecioCanje
} = require('../controllers/precioCanje.controller');

// ADMIN ONLY
/**
 * @swagger
 * /api/v1/canjes/precio-canje:
 *   post:
 *      summary: Registrar precio de canje
 *      description: Registra un nuevo precio de canje en la base de datos
 *      tags: [Canjes]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: objeto precioCanje
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/registrarCanje'
 *      responses:
 *        "201":
 *          description: 'Precio de canje registrado'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "401":
 *          $ref: '#/components/responses/401'
 */
router.post('/precio-canje', 
    authMiddleware,
    roleMiddleware(['admin']),
    detectarSuperposicionSimple,
    addPrecioCanje
);
/**
 * @swagger
 * /api/v1/canjes/{idCanje}:
 *   delete:
 *      summary: Eliminar precio de canje
 *      description: Elimina un precio de canje registrado
 *      tags: [Canjes]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - $ref: '#/components/parameters/CanjeIdParam'
 *      responses:
 *        "201":
 *          description: 'Precio de canje eliminado'
 *        "401":
 *          $ref: '#/components/responses/401'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.delete('/:id', 
    authMiddleware,
    roleMiddleware(['admin']),
    deletePrecioCanje
);
/**
 * @swagger
 * /api/v1/canjes/{idCanje}:
 *   patch:
 *      summary: Editar precio de canje
 *      description: Edita sólo el precio de un objeto precioCanje registrado
 *      tags: [Canjes]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - $ref: '#/components/parameters/CanjeIdParam'
 *      requestBody:
 *        description: nuevo precio
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/editPrecioCanje'
 *      responses:
 *        "201":
 *          description: 'Precio de canje editado correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "401":
 *          $ref: '#/components/responses/401'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.patch('/:id', 
    authMiddleware,
    roleMiddleware(['admin']),
    editPrecioCanje
);

// PUBLIC
/**
 * @swagger
 * /api/v1/canjes/modelos/{idLinea}:
 *   get:
 *      summary: Modelos por línea
 *      description: Devuelve el listado de los distintos modelos por linea de producto
 *      tags: [Canjes]
 *      parameters:
 *        - $ref: '#/components/parameters/LineaNombreParam'
 *      responses:
 *        "200":
 *          description: Listado de modelos diferentes por línea
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                        type: string
 *                      example:
 *                        - "11 128GB"
 *                        - "16 Pro 256GB"
 */
router.get('/modelos/:linea', getModelos);
/**
 * @swagger
 * /api/v1/canjes/lineas/:
 *   get:
 *      summary: Listado de lineas
 *      description: Devuelve el listado de las diferentes líneas de productos registradas en la base de precios de canje
 *      tags: [Canjes]
 *      responses:
 *        "200":
 *          description: Listado de líneas registradas (distinct)
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                        type: string
 *                      example:
 *                        - "iPhone"
 *                        - "iPad"
 */
router.get('/lineas/', getLineas);
/**
 * @swagger
 * /api/v1/canjes/:
 *   get:
 *      summary: Lista de precios de canje
 *      description: Devuelve el listado de precios de canje registrados
 *      tags: [Canjes]
 *      responses:
 *        "200":
 *          description: Listado de precios de canje registrados
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/precioCanje']          
 */
router.get('/', getPreciosCanjes);

module.exports = router;