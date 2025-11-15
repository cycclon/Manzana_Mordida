/**
 * @swagger
 * tags:
 *  name: Sucursales
 *  description: Endpoints de gestión de sucursales
 */
// MIDDLEWARE IMPORTS
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
// CONTROLLER
const {
    getSucursales, 
    getSucursalID, 
    getSucursalesLocalidad,
    addSucursal,
    editSucursal,
    deleteSucursal
} = require('../controllers/sucursal.controller');

const express = require('express');
const router = express.Router();

// PUBLIC

/**
 * @swagger
 * /api/v1/sucursales/{ProvinciaLocalidad}:
 *   get:
 *      summary: Sucursales por provincia y localidad
 *      tags: [Sucursales]
 *      parameters:
 *        - $ref: '#/components/parameters/ProvinciaLocalidadParam'
 *      responses:
 *        "200":
 *          description: Listado de sucursales para la provincia y localidad seleccionadas
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/sucursal']
 */
router.get('/provincia/:provloc', getSucursalesLocalidad);

/**
 * @swagger
 * /api/v1/sucursales/{id}:
 *   get:
 *      summary: Sucursal por ID
 *      tags: [Sucursales]
 *      parameters:
 *        - $ref: '#/components/parameters/SucursalIdParam'
 *      responses:
 *        "200":
 *          description: Objeto sucursal
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/sucursal'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "404":
 *          $ref: '#/components/responses/404'     
 */
router.get('/:id', getSucursalID);

/**
 * @swagger
 * /api/v1/sucursales/:
 *   get:
 *      summary: Listado de sucursales
 *      tags: [Sucursales]
 *      responses:
 *        "200":
 *          description: Listado de sucursales registrados
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/sucursal']          
 */
router.get('/', getSucursales);

//router.get('/test', (req, res) => res.send('Test OK'));

// ADMIN OR SALES
/**
 * @swagger
 * /api/v1/sucursales/nueva-sucursal:
 *   post:
 *      summary: Registrar sucursal
 *      tags: [Sucursales]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Sucursal a insertar en la base de datos.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/nuevaSucursal'
 *      responses:
 *        "201":
 *          description: 'Sucursal registrada correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "401":
 *          $ref: '#/components/responses/401'
 */
router.post('/nueva-sucursal', authMiddleware, roleMiddleware(['admin']), addSucursal);
/**
 * @swagger
 * /api/v1/sucursales/{idSucursal}:
 *   patch:
 *      summary: Editar sucursal
 *      tags: [Sucursales]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - $ref: '#/components/parameters/SucursalIdParam'
 *      requestBody:
 *        description: objeto sucursal con campos editados
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/editSucursal'
 *      responses:
 *        "201":
 *          description: 'Sucursal editada correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "401":
 *          $ref: '#/components/responses/401'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.patch('/:id', authMiddleware, roleMiddleware(['admin']), editSucursal);
/**
 * @swagger
 * /api/v1/sucursales/{idSucursal}:
 *   delete:
 *      summary: Eliminar sucursal
 *      tags: [Sucursales]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - $ref: '#/components/parameters/SucursalIdParam'
 *      responses:
 *        "201":
 *          description: 'Sucursal eliminada'
 *        "401":
 *          $ref: '#/components/responses/401'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteSucursal);

module.exports = router;