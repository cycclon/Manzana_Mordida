/**
 * @swagger
 * tags:
 *  name: Clientes
 *  description: Endpoints de gestión de clientes
 */
const { getClientes, addCliente } = require('../controllers/cliente.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');

const express = require('express');
const router = express.Router();

// PUBLIC
/**
 * @swagger
 * /api/v1/clientes/crear-cliente:
 *   post:
 *      summary: Registra un nuevo cliente en la base de datos
 *      tags: [Clientes]
 *      requestBody:
 *        description: Objeto a insertar en la base de datos
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/nuevoCliente'
 *      responses:
 *        "201":
 *          description: 'Cliente registrado correctamente'
 *        "400":
 *          description: 'Datos faltantes o incorrectos'
 */
router.post('/nuevo-cliente', addCliente);

// ADMIN OR SALES
/**
 * @swagger
 * /api/v1/clientes/:
 *   get:
 *      summary: Devuelve el listado de clientes registrados
 *      tags: [Clientes]
 *      security:
 *       - bearerAuth: []
 *      responses:
 *        "200":
 *          description: Listado de clientes registrados
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/cliente']          
 */
router.get('/', authMiddleware, roleMiddleware(['admin', 'sales']), getClientes);

module.exports = router;