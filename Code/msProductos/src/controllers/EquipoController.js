const Equipo = require('../schemas/EquipoSchema');
const { getCachedColorMap } = require('../utils/ColorCache');
const { getProductoByName } = require('../utils/ProductoUtils');

exports.getEquipos = async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
};

exports.addEquipo = async (req, res, next) => {
    try {
        const {producto, condicionBateria, condicion, grado, estado, costo, precio, detalles, accesorios, color, garantiaApple, garantiaPropia} = req.body;

        // Obtener producto por nombre
        const p = await getProductoByName(producto);
        // Verificar que el producto exista, sino disparar un error
        if(!p) throw new Error('Producto inexistente');

        // Obtener colores en cache
        const cachedColors = await getCachedColorMap();
        const idColor = cachedColors.get(color);
        //Verificar que el color exista, sino disparar un error
        if(!idColor) throw new Error('Color inexistente');

        const nuevoEquipo = new Equipo({
            producto: p._id,
            condicionBateria,
            condicion,
            grado,
            estado,
            costo,
            precio,
            detalles,
            accesorios,
            garantiaApple,
            garantiaPropia,
            color: idColor, // Obtener id de color por nombre
        });        

        // console.log(nuevoEquipo);
        await nuevoEquipo.save();
        res.status(201).json({message: 'Equipo registrado'});
    } catch (error) {
        next(error);
    }
};