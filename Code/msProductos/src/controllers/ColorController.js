const Color = require('../schemas/ColorSchema');
const colorCache = require('../utils/ColorCache');

// GET ALL COLORS
exports.getColores = async (req, res, next) => {
    try {
        const colores = await Color.find({}).sort({ nombre: 1 });
        res.status(200).json(colores);
    } catch (error) {
        next(error);
    }
};

// GET COLOR BY ID
exports.getColorId = async (req, res, next) => {
    try {
        const color = await Color.findById({ _id: req.params.id });
        if (!color) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }
        res.status(200).json(color);
    } catch (error) {
        next(error);
    }
};

// CREATE NEW COLOR
exports.addColor = async (req, res, next) => {
    try {
        const { nombre, hex } = req.body;

        // Check if color already exists
        const existingColor = await Color.findOne({
            $or: [{ nombre }, { hex }]
        });

        if (existingColor) {
            return res.status(400).json({
                message: 'Ya existe un color con ese nombre o código hexadecimal'
            });
        }

        const color = new Color({ nombre, hex });
        await color.save();
        colorCache.invalidateColorCache();

        res.status(201).json({
            message: 'Color registrado exitosamente',
            data: color
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE COLOR
exports.editColor = async (req, res, next) => {
    try {
        const { nombre, hex } = req.body;
        const color = await Color.findById({ _id: req.params.id });

        if (!color) {
            return res.status(404).json({ message: 'Color no encontrado' });
        }

        // Check if new values conflict with existing colors
        if (nombre && nombre !== color.nombre) {
            const existingNombre = await Color.findOne({ nombre, _id: { $ne: req.params.id } });
            if (existingNombre) {
                return res.status(400).json({ message: 'Ya existe un color con ese nombre' });
            }
            color.nombre = nombre;
        }

        if (hex && hex !== color.hex) {
            const existingHex = await Color.findOne({ hex, _id: { $ne: req.params.id } });
            if (existingHex) {
                return res.status(400).json({ message: 'Ya existe un color con ese código hexadecimal' });
            }
            color.hex = hex;
        }

        await color.save();
        colorCache.invalidateColorCache();
        res.status(200).json({
            message: 'Color modificado exitosamente',
            data: color
        });
    } catch (error) {
        next(error);
    }
};

// DELETE COLOR
exports.deleteColor = async (req, res, next) => {
    try {
        const Producto = require('../schemas/ProductoSchema');
        const Equipo = require('../schemas/EquipoSchema');

        // Check if color is being used by any product
        const productosUsandoColor = await Producto.findOne({
            colores: req.params.id
        });

        if (productosUsandoColor) {
            return res.status(400).json({
                message: 'No se puede eliminar el color porque está siendo utilizado por uno o más productos'
            });
        }

        // Check if color is being used by any equipment
        const equiposUsandoColor = await Equipo.findOne({
            color: req.params.id
        });

        if (equiposUsandoColor) {
            return res.status(400).json({
                message: 'No se puede eliminar el color porque está siendo utilizado por uno o más equipos'
            });
        }

        const color = await Color.findByIdAndDelete({ _id: req.params.id });

        if (!color) {
            return res.status(404).json({ message: 'Color no encontrado' });
        } else { colorCache.invalidateColorCache(); }

        res.status(200).json({ message: 'Color eliminado exitosamente' });
    } catch (error) {
        next(error);
    }
};
