const Producto = require('../schemas/ProductoSchema');
const { ValidarColoresIds } = require('../utils/ProductoUtils');

// DEVUELVE TODOS LOS PRODUCTOS
exports.getProductos = async (req, res, next) => {
    try {
        const productos = await Producto.find({}).populate('colores', 'nombre');
        // console.log(productos);
        res.status(200).json(productos);
    } catch (error) {
        next(error);
    }    
};

// OBTIENE UN PRODUCTO POR ID
exports.getProductoId = async (req, res, next) => {
    try {
        const producto = await Producto.findById({_id: req.params.id}).populate('colores', 'nombre');

        res.status(201).json(producto);
    } catch (error) {
        next(error)
    }
}

// REGISTRA UN NUEVO PRODUCTO
exports.addProducto = async (req, res, next) => {
    try {
        const { marca, linea, modelo, colores } = req.body;
        const producto = new Producto();
        
        producto.marca = marca;
        producto.linea = linea;
        producto.modelo = modelo;
        producto.colores = await ValidarColoresIds(colores);

        await producto.save();
        res.status(201).json({ message: 'Producto registrado' });
    } catch (error) {
        next(error);
    }
};

// EDITA UN PRODUCTO REGISTRADO SEGUN SU ID
exports.editProducto = async (req, res, next) => {
    try {
        const producto = await Producto.findById({_id: req.params.id});
        producto.colores = req.body.colores && await ValidarColoresIds(req.body.colores) || producto.colores;
        
        producto.save();

        res.status(201).json({ message: 'Producto modificado.'})
    } catch (error) {
        next(error);
    }
};