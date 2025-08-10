const mongoose = require('mongoose');
const Equipo = require('../schemas/EquipoSchema');

module.exports = async (req, res, next) => {
    const idEquipo = req.params.id;
    
    // Verificar si el ID tiene el formato correcto
    if(!mongoose.isValidObjectId(idEquipo)) {
        res.status(404).json({message: 'Equipo no encontrado'});
        return
    } else {
        // Verificar si el ID existe en la base de datos
        const count = await Equipo.countDocuments({ _id: req.params.id });
        if(count===0){
            res.status(404).json({message: 'Equipo no encontrado'});
            return
        } else next();        
    }
};