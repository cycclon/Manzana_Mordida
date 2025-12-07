const mongoose = require('mongoose');

const canjeSchema = new mongoose.Schema({
    linea: {
        type: String,
        required: true,
        enum: ['iPhone', 'MacBook', 'iPad', 'AirPods', 'Watch'],
    },
    modelo: {
        type: String,
        required: true
    },
    bateria: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    }
});

const clienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    telefono: {
        type: String,
        required: false
    },
    canje: {
        type: canjeSchema,
        required: false
    }
});

const citaSchema = new mongoose.Schema({
    cliente: clienteSchema,
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
    horaInicio: {
        type: Number,
        required: true
    },
    duracion: { // Horas
        type: Number,
        required: true,
        default: 1.5
    },
    vendedor: {
        type: String,
        required: false
    },
    motivoCancelacion: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model('cita', citaSchema);