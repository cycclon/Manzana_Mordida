const Producto = require('../schemas/ProductoSchema');

exports.getProductos = async (req, res, next) => {
    try {
        const productos = await Producto.find({}).populate('colores', 'nombre');
        // console.log(productos);
        res.send(productos);
    } catch (error) {
        next(error);
    }    
};

exports.addProducto = async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
};

