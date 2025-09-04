const mongoose = require('mongoose');

const cancelacionCita = new mongoose.Schema({
    motivo: String,
    fecha: Date,
    idCita: mongoose.Schema.Types.ObjectId
}, {collection: 'cancelaciones_citas'});

module.exports = new mongoose.model('cancelacion_cita', cancelacionCita);