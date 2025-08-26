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
    entreCalles: {
        type: [String],
        required: false
    },
    referencias: {
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
    googleMaps: {
        type: String,
        required: false
    }
});

module.exports = new mongoose.model('sucursal', sucursalSchema);