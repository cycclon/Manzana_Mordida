const Producto = require('../schemas/ProductoSchema');
const colorCache = require('../utils/ColorCache');

// DEVUELVE TODOS LOS PRODUCTOS
exports.getProductos = async (req, res, next) => {
    try {
        const productos = await Producto.find({}).populate('colores', 'nombre');
        // console.log(productos);
        res.send(productos);
    } catch (error) {
        next(error);
    }    
};

// REGISTRA UN NUEVO PRODUCTO
exports.addProducto = async (req, res, next) => {
    try {
        const { marca, linea, modelo, colores } = req.body;
        const producto = new Producto();
        const cachedColors = await colorCache.getCachedColorMap();

        const colorIds = [];
        const notFound = [];

        // Recorrer mapa de colores en caché y agregar las ids de los colores que existen. Guardar los nombres de los colores queno existen en un array
        for(const name of colores) {
            if(cachedColors.has(name)) {
                colorIds.push(cachedColors.get(name));
            } else {
                notFound.push(name);
            }
        }

        // Si el array de colores no encontrados contiene algún valor, disparar un error
        if(notFound.length > 0){
            throw new Error(`Los siguientes colores no están registrados en la base de datos: ${notFound}`);
        }

        producto.marca = marca;
        producto.linea = linea;
        producto.modelo = modelo;
        producto.colores = colorIds;

        await producto.save();
        res.status(201).json({ message: 'Producto registrado' });
    } catch (error) {
        next(error);
    }
};