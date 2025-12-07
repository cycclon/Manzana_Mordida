/**
 * @swagger
 * tags:
 *  name: Productos
 *  description: Endpoints para gestión de productos
 */
const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');
const ProductoIdValidator = require('../middleware/ProductoIdValidator');
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');

// PUBLICO
/**
 * @swagger
 * /api/productos/:
 *   get:
 *      summary: Listado de productos
 *      tags: [Productos]
 *      responses:
 *        "200":
 *          description: Listado de equipos registrados
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items: [$ref: '#/components/schemas/producto']          
 */
router.get('/', ProductoController.getProductos);
/**
 * @swagger
 * /api/productos/producto/{id}:
 *   get:
 *      summary: Producto por ID
 *      tags: [Productos]
 *      responses:
 *        "200":
 *          description: Producto
 *          content:
 *              application/json:
 *                schema:
 *                  $ref: '#/components/schemas/producto'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.get('/producto/:id', ProductoIdValidator, ProductoController.getProductoId);

// JWT ADMIN O SALES
/**
 * @swagger
 * /api/productos/crear-producto:
 *   post:
 *      summary: Registrar producto
 *      tags: [Productos]
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Objeto producto a insertar en la base de datos
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/producto'
 *      responses:
 *        "201":
 *          description: 'Producto registrado correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.post(
    '/crear-producto',
    authMiddleware, 
    roleMiddleware(['admin', 'sales']), 
    ProductoController.addProducto
);

/**
 * @swagger
 * /api/productos/producto/{idProducto}:
 *   put:
 *      summary: Editar producto
 *      tags: [Productos]
 *      parameters:
 *        - $ref: '#/components/parameters/ProductoIdParam'
 *      security:
 *       - bearerAuth: []
 *      requestBody:
 *        description: Listado de colores editado
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items: 
 *                type: string                  
 *      responses:
 *        "201":
 *          description: 'Producto editado correctamente'
 *        "400":
 *          $ref: '#/components/responses/400'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.put(
    '/producto/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    ProductoIdValidator,
    ProductoController.editProducto
);

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *      summary: Eliminar producto
 *      description: Elimina un producto si no tiene dispositivos asociados
 *      tags: [Productos]
 *      parameters:
 *        - $ref: '#/components/parameters/ProductoIdParam'
 *      security:
 *       - bearerAuth: []
 *      responses:
 *        "200":
 *          description: 'Producto eliminado correctamente'
 *        "400":
 *          description: 'No se puede eliminar el producto porque tiene dispositivos asociados'
 *        "404":
 *          $ref: '#/components/responses/404'
 */
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['admin', 'sales']),
    ProductoIdValidator,
    ProductoController.deleteProducto
);

module.exports = router;