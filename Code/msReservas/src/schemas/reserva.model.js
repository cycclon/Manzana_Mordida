const mongoose = require('mongoose');

const equipoSchema = new mongoose.Schema({
    linea: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    condicion: {
        type: String,
        required: true
    },
    bateria: {
        type: Number,
        required: false,
        min: 0,
        max: 1
    }
});

const senaSchema = new mongoose.Schema({
    monto: {
        type: Number,
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['Solicitada', 'Pagada', 'Confirmada', 'Vencida']
    }
});

const clienteSchema = new mongoose.Schema({
    nombreUsuario: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true
    }
});

const reservaSchema = new mongoose.Schema({
    cliente: clienteSchema,
    equipo: equipoSchema,
    fecha: {
        type: Date,
        required: true
    },
    sucursal: {
        type: String,
        required: true
    },
    sena: senaSchema,
    estado: {
        type: String,
        required: true,
        enum: ['Solicitada', 'Confirmada', 'Completada', 'Cancelada', 'Vencida']
    }
});

module.exports = mongoose.model('reserva', reservaSchema);