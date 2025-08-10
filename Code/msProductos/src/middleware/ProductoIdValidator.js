const mongoose = require('mongoose');
const Producto = require('../schemas/ProductoSchema');

module.exports = async (req, res, next) => {
    const idProducto = req.params.id;
    
    // Verificar si el ID tiene el formato correcto
    if(!mongoose.isValidObjectId(idProducto)) {
        res.status(404).json({message: 'Producto no encontrado'});
        return
    } else {
        // Verificar si el ID existe en la base de datos
        const count = await Producto.countDocuments({ _id: req.params.id });
        if(count===0){
            res.status(404).json({message: 'Producto no encontrado'});
            return
        } else next();        
    }
};