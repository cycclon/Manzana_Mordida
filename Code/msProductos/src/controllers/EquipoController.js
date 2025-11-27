const Equipo = require('../schemas/EquipoSchema');
const { getCachedColorMap } = require('../utils/ColorCache');
const { getProductoByName } = require('../utils/ProductoUtils');
const mongoose = require('mongoose');
const { uploadImage, deleteImage } = require('../utils/R2Client');

// Producto populate
const prodPopulate = [
                        { path: 'producto', select: 'marca linea modelo' },
                        { path: 'color', select: 'nombre hex' }
                    ];

// OBTENER TODOS LOS EQUIPOS
exports.getEquipos = async (req, res, next) => {
    try {
        // Build filter query from request params
        const filter = {};

        // Filter by condition (condicion)
        if (req.query.condition) {
            filter.condicion = req.query.condition;
        }

        // Filter by estado (status)
        if (req.query.estado) {
            filter.estado = req.query.estado;
        }

        // Filter by grade (grado)
        if (req.query.grado) {
            filter.grado = req.query.grado;
        }

        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.precio = {};
            if (req.query.minPrice) {
                filter.precio.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.precio.$lte = parseFloat(req.query.maxPrice);
            }
        }

        // Filter by battery health (condicionBateria)
        if (req.query.minBatteryHealth) {
            filter.condicionBateria = { $gte: parseFloat(req.query.minBatteryHealth) / 100 };
        }

        // Filter by canjeable (tradeable)
        if (req.query.canjeable !== undefined) {
            filter.canjeable = req.query.canjeable === 'true';
        }

        // Obtener equipos con filtros y completar campo producto y campo color (referencias)
        const equipos = await Equipo.find(filter).populate(prodPopulate);

        // If search query is provided, filter by producto model/marca/linea after populate
        let filteredEquipos = equipos;
        if (req.query.search) {
            const searchLower = req.query.search.toLowerCase();
            filteredEquipos = equipos.filter(equipo => {
                const producto = equipo.producto;
                return (
                    producto.modelo?.toLowerCase().includes(searchLower) ||
                    producto.marca?.toLowerCase().includes(searchLower) ||
                    producto.linea?.toLowerCase().includes(searchLower)
                );
            });
        }

        res.status(200).json(filteredEquipos);
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
            res.status(200).json(equipo);
            return
        }
    } catch (error) {
       next(error);
    }
}

// Registrar nuevo equipo
exports.addEquipo = async (req, res, next) => {
    try {
        const {producto, condicionBateria, condicion, grado, estado, costo, precio, detalles, accesorios, color, garantiaApple, garantiaPropia, ubicacion, canjeable} = req.body;

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
            ubicacion,
            canjeable
        });        

        // console.log(nuevoEquipo);
        await nuevoEquipo.save();
        res.status(201).json({message: 'Equipo registrado'});
    } catch (error) {
        next(error);
    }
};

exports.editEquipo = async (req, res, next) => {
    //console.log('edit equipo');
    try {
        const equipoEditado = await Equipo.findOne({_id: req.params.id});
        const { condicionBateria, grado, estado, costo, precio, detalles, accesorios, garantiaApple, garantiaPropia, ubicacion, canjeable} = req.body;

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
        equipoEditado.canjeable = canjeable || equipoEditado.canjeable;

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

exports.uploadImagenes = async (req, res, next) => {
    try {
        const equipo = await Equipo.findById(req.params.id);
        
        if(!equipo) {
            return res.status(404).json({ message: 'Equipo no encontrado'});
        }

        // Check total images (existing + new)
        const currentCount = equipo.imagenes?.length || 0;
        const newCount = req.files.length;

        if(currentCount + newCount > 5) {
            return res.status(400).json({
                message: `Máximo 5 imágenes permitidas. Actualmente: ${currentCount}, intentando agregar ${newCount}`
            });
        }

        // Upload images to R2
        const uploadPromises = req.files.map(file => uploadImage(file));
        const imageUrls = await Promise.all(uploadPromises);

        // Add URLs to equipo
        equipo.imagenes = [...(equipo.imagenes || []), ...imageUrls];
        await equipo.save();

        res.json({
            message: 'Imágenes subidas exitosamente'
        });        
    } catch (error) {
        next(error);
    }
};

exports.deleteImagen = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;

        if(!imageUrl) {
            return res.status(400).json({message: 'imageUrl requerido'});
        }

        const equipo = await Equipo.findById(req.params.id);
        
        if(!equipo) {
            return res.status(404).json({message: 'Equipo no encontrado'});            
        }

        // remove from R2
        await deleteImage(imageUrl);

        // Remove from database
        equipo.imagenes = equipo.imagenes.filter(img => img !== imageUrl);
        await equipo.save();

        return res.json({
            message: 'Imagen eliminada exitosamente'
        });
    } catch (error) {
        next(error);
    }
};