const Producto = require('../schemas/ProductoSchema');
const { ValidarColoresIds } = require('../utils/ProductoUtils');

// DEVUELVE TODOS LOS PRODUCTOS
exports.getProductos = async (req, res, next) => {
    try {
        const productos = await Producto.find({}).populate('colores', 'nombre hex');
        // console.log(productos);
        res.status(200).json(productos);
    } catch (error) {
        next(error);
    }
};

// OBTIENE UN PRODUCTO POR ID
exports.getProductoId = async (req, res, next) => {
    try {
        const producto = await Producto.findById({_id: req.params.id}).populate('colores', 'nombre hex');

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
        console.log(req.body.colores);
        producto.colores = req.body.colores && await ValidarColoresIds(req.body.colores) || producto.colores;

        producto.save();

        res.status(201).json({ message: 'Producto modificado.'})
    } catch (error) {
        next(error);
    }
};

// ELIMINA UN PRODUCTO POR ID
exports.deleteProducto = async (req, res, next) => {
    try {
        const Equipo = require('../schemas/EquipoSchema');
        const { id } = req.params;

        // Check if there are any devices (equipos) associated with this product
        const equiposCount = await Equipo.countDocuments({ producto: id });

        if (equiposCount > 0) {
            return res.status(400).json({
                message: `No se puede eliminar el producto porque tiene ${equiposCount} dispositivo(s) asociado(s)`
            });
        }

        // If no devices are associated, delete the product
        await Producto.findByIdAndDelete(id);

        res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        next(error);
    }
};