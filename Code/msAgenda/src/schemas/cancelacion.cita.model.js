const mongoose = require('mongoose');

const cancelacionCita = new mongoose.Schema({
    motivo: String,
    fecha: Date,
    idCita: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'citas',
        required: true
    }
}, {collection: 'cancelaciones_citas'});

module.exports = new mongoose.model('cancelacion_cita', cancelacionCita);