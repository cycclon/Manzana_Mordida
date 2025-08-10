const Equipo = require('../schemas/EquipoSchema');
const { getCachedColorMap } = require('../utils/ColorCache');
const { getProductoByName } = require('../utils/ProductoUtils');
const mongoose = require('mongoose');

// Producto populate
const prodPopulate = [
                        { path: 'producto', select: 'marca linea modelo' },
                        { path: 'color', select: 'nombre hex' }
                    ];

// OBTENER TODOS LOS EQUIPOS
exports.getEquipos = async (req, res, next) => {
    try {
        // Obtener equipos y completar campo producto y campo color (referencias)
        const equipos = await Equipo.find({}).populate(prodPopulate);        

        res.status(201).json(equipos);
    } catch (error) {
        next(error);
    }
};

// OBTENER EQUIPO POR ID
exports.getEquipoID = async (req, res, next) => {
    try {
        // Obtener equipo y completar campo producto y campo color (referencias)
        const equipo = await Equipo.findOne({ _id: req.params.id }).populate(prodPopulate);

        // Si se encuentra algún equipo, se devuelve, sino se envía un mensaje de error 404
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

// Registrar nuevo equipo
exports.addEquipo = async (req, res, next) => {
    try {
        const {producto, condicionBateria, condicion, grado, estado, costo, precio, detalles, accesorios, color, garantiaApple, garantiaPropia, ubicacion} = req.body;

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
            color: idColor,
            garantiaApple,
            garantiaPropia,
            ubicacion
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
        const equipoEditado = await Equipo.findOne({_id: req.params.id});
        const { condicionBateria, grado, estado, costo, precio, detalles, accesorios, garantiaApple, garantiaPropia, ubicacion} = req.body;

        // Verificar si cada variable del cuerpo tiene algun valor, si lo tiene, establecerla
        equipoEditado.condicionBateria = condicionBateria || equipoEditado.condicionBateria;
        equipoEditado.grado = grado || equipoEditado.grado;
        equipoEditado.estado = estado || equipoEditado.estado;
        equipoEditado.costo = costo || equipoEditado.costo;
        equipoEditado.precio = precio || equipoEditado.precio;
        equipoEditado.detalles = detalles || equipoEditado.detalles;
        equipoEditado.accesorios = accesorios || equipoEditado.accesorios;
        equipoEditado.garantiaApple = garantiaApple || equipoEditado.garantiaApple;
        equipoEditado.garantiaPropia = garantiaPropia || equipoEditado.garantiaPropia;
        equipoEditado.ubicacion = ubicacion || equipoEditado.ubicacion;

        await equipoEditado.save();

        res.status(201).json({message: "Equipo editado."})
    } catch (error) {
        next(error);
    }
};

exports.deleteEquipo = async (req, res, next) => {
    try {
        await Equipo.deleteOne({ _id: req.params.id });
        res.status(201).json({message: "Equipo eliminado."})
    } catch (error) {
        next(error);
    }
};