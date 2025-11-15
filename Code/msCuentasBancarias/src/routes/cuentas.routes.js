/**
 * @swagger
 * tags:
 *  name: Cuentas
 *  description: Endpoints para gestión de cuentas bancarias
 */
const express = require('express');
const Cuenta = require('../schemas/cuenta.model');
// MIDDLEWARE
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
// CONTROLLER
const { addCuenta, getCuentas, deleteCuenta, editCuenta } = require('../controllers/cuentas.controller');

const router = new express.Router();

// ADMIN ONLY
/**
 * @swagger
 * /api/v1/cuentas/registrar:
 *   post:
 *      summary: Registrar cuenta bancaria
 *      description: Registra una nueva cuenta bancaria en la base de datos
 *      tags: [Cuentas]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Objeto JSON con los datos de la cuenta a registrar
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/nuevaCuenta'
 *      responses:
 *        "201":
 *          description: 'Cuenta registrada correctamente.'
 *        "400":
 *          $ref: '#/components/responses/400'
 */
router.post('/registrar', 
    authMiddleware, 
    roleMiddleware(['admin']),
    addCuenta,
);
/**
 * @swagger
 * /api/v1/cuentas/{id}:
 *   patch:
 *      summary: Editar cuenta
 *      description: Edita el alias o las monedas permitidas por la cuenta
 *      tags: [Cuentas]
 *      parameters:
 *        - $ref: '#/components/parameters/CuentaIdParam'
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Campos editados
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/cuentaEditada'
 *      responses:
 *        "201":
 *          description: 'Cuenta editada correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.patch('/:id', 
    authMiddleware, 
    roleMiddleware(['admin']),
    editCuenta,
);
/**
 * @swagger
 * /api/v1/cuentas/{idCuenta}:
 *   delete:
 *      summary: Elimina una cuenta registrada
 *      tags: [Cuentas]
 *      parameters:
 *        - $ref: '#/components/parameters/CuentaIdParam'
 *      security:
 *       - bearerAuth: []
 *      responses:
 *        "201":
 *          description: 'Cuenta eliminada correctamente'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['admin']),
    deleteCuenta,
);

// PUBLIC
/**
 * @swagger
 * /api/v1/cuentas/:
 *   get:
 *      summary: Listado de cuentas
 *      description: Devuelve el listado de las cuentas bancarias registradas en la base de datos
 *      tags: [Cuentas]
 *      responses:
 *        "200":
 *          description: Listado de cuentas registradas
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/cuenta']          
 */
router.get('/', getCuentas);

module.exports = router;