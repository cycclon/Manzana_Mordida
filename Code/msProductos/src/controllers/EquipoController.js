const Equipo = require('../schemas/EquipoSchema');
const { getCachedColorMap } = require('../utils/ColorCache');
const { getProductoByName } = require('../utils/ProductoUtils');
const mongoose = require('mongoose');

exports.getEquipos = async (req, res, next) => {
    try {
        const equipos = await Equipo.find({});

        res.status(201).json(equipos);
    } catch (error) {
        next(error);
    }
};

exports.getEquipoID = async (req, res, next) => {
    try {
        
        const idEquipo = req.params.id;
        if(!mongoose.isValidObjectId(idEquipo)) {
            res.status(404).json({message: 'Equipo no encontrado'});
            return
        }
        const equipo = await Equipo.findOne({_id: idEquipo});

        if(!equipo) {
            res.status(404).json({message: 'Equipo no encontrado'});
            return
        } else {
            res.status(201).json(equipo);
            return
        }
    } catch (error) {
       next(error);
    }
}

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

exports.editEquipo = async (req, res, next) => {
    try {
        const idEquipo = req.params.id;
        console.log(idEquipo);

        res.status(201).json({message: "Equipo editado."})
    } catch (error) {
        next(error);
    }
};

exports.deleteEquipo = async (req, res, next) => {
    try {
        const idEquipo = req.params.id;
        console.log(idEquipo);

        res.status(201).json({message: "Equipo eliminado."})
    } catch (error) {
        next(error);
    }
};