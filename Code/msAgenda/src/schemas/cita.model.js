const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    sucursal: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        enum: ['Solicitada', 'Confirmada', 'Cancelada', 'Reprogramada']
    },
    reprogramada: {
        type: mongoose.SchemaTypes.ObjectId,
        required: false
    },
    duracion: { // Horas
        type: Number,
        required: true,
        default: 1.5
    }    
});

module.exports = mongoose.model('cita', citaSchema);