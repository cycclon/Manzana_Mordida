const mongoose = require('mongoose');

const direccionSchema = new mongoose.Schema({
    calle: {
        type: String,
        required: true
    },
    altura: {
        type: Number,
        required: false
    },
    piso: {
        type: String,
        required: false
    },
    departamento: {
        type: String,
        required: false
    },
    entreCalles: { // EDITABLE
        type: [String],
        required: false
    },
    referencias: { // EDITABLE
        type: [String],
        required: false
    }
});

const sucursalSchema = new mongoose.Schema({
    provincia: {
        type: String,
        required: true
    },
    localidad: {
        type: String,
        required: true
    },
    direccion: direccionSchema,
    barrio: {
        type: String,
        required: true
    },
    googleMaps: { // EDITABLE
        type: String,
        required: false
    }
}, { collection: 'sucursales' });

module.exports = new mongoose.model('sucursal', sucursalSchema);