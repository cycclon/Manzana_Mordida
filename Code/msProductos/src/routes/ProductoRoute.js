const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');
const ProductoIdValidator = require('../middleware/ProductoIdValidator');
const { authMiddleware, roleMiddleware } = require('../middleware/securityHandler');

// PUBLICO
router.get('/', ProductoController.getProductos);
router.get('/producto/:id', ProductoIdValidator, ProductoController.getProductoId);

// JWT ADMIN O SALES
router.post(
    '/crear-producto',
    authMiddleware, 
    roleMiddleware(['admin', 'sales']), 
    ProductoController.addProducto
);
router.put(
    '/producto/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'sales']), 
    ProductoIdValidator, 
    ProductoController.editProducto
);

module.exports = router;