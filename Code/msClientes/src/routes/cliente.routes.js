/**
 * @swagger
 * tags:
 *  name: Clientes
 *  description: Endpoints de gestión de clientes
 */
const { 
    getClientes, 
    addCliente, 
    getCliente, 
    editCliente 
} = require('../controllers/cliente.controller');
// MIDDLEWARE IMPORTS
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');
const { checkSelfRequest } = require('../middleware/ownData');

const express = require('express');
const router = express.Router();

// PUBLIC
/**
 * @swagger
 * /api/v1/clientes/nuevo-cliente:
 *   post:
 *      summary: Registrar cliente
 *      description: Primero se debe registrar el usuario asociado en el microservicio de seguridad (msSeguridad). Comprueba que el usuario no esté vinculado a otro cliente.
 *      tags: [Clientes]
 *      requestBody:
 *        description: Cliente a insertar en la base de datos.
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
 *      summary: Listado de clientes
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

// OWN DATA
/**
 * @swagger
 * /api/v1/clientes/{id}:
 *   get:
 *      summary: Cliente por ID.
 *      description: Sólo puede acceder a los datos de un cliente, el propio cliente, y debe estar logueado.
 *      tags: [Clientes]
 *      security:
 *       - bearerAuth: []
 *      parameters:
 *        - $ref: '#/components/parameters/ClienteIdParam'
 *      responses:
 *        "200":
 *          description: Objeto cliente
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/cliente'
 *        "401":
 *          description: 'Acceso prohibido'
 *        "404":
 *          description: 'Cliente no encontrado'
 */
router.get('/:id', authMiddleware, roleMiddleware(['viewer']), checkSelfRequest, getCliente);
/**
 * @swagger
 * /api/v1/clientes/{idCliente}:
 *   patch:
 *      summary: Editar cliente.
 *      description: Sólo puede editar los datos de un cliente, el propio cliente, y debe estar logueado.
 *      tags: [Clientes]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Datos editados del cliente.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/clienteEditado'
 *      parameters:
 *        - $ref: '#/components/parameters/ClienteIdParam'
 *      responses:
 *        "200":
 *          description: 'Datos editados'
 *        "401":
 *          description: 'Acceso prohibido'
 *        "404":
 *          description: 'Cliente no encontrado'
 */
router.patch('/:id', authMiddleware, roleMiddleware(['viewer']), checkSelfRequest, editCliente);

module.exports = router;