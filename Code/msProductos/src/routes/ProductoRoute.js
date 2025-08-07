const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');

router.get('/', ProductoController.getProductos);
router.post('/crear-producto', ProductoController.addProducto);

module.exports = router;