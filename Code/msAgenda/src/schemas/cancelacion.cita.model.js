const mongoose = require('mongoose');

const cancelacionCita = new mongoose.Schema({
    motivo: String,
    fecha: Date
}, {collection: 'cancelaciones_citas'});

module.exports = new mongoose.model('cancelacion_cita', cancelacionCita);