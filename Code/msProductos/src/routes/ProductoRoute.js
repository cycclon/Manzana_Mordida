const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');
const ProductoIdValidator = require('../middleware/ProductoIdValidator');

// PUBLICO
router.get('/', ProductoController.getProductos);
router.get('/producto/:id', ProductoIdValidator, ProductoController.getProductoId);

// JWT ADMIN O SALES
router.post('/crear-producto', ProductoController.addProducto);
router.put('/producto/:id', ProductoIdValidator, ProductoController.editProducto);

module.exports = router;