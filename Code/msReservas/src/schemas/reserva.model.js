const mongoose = require('mongoose');

const canjeSchema = new mongoose.Schema({
    linea: {
        type: String,
        required: true
    },
    modelo: {
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
    },
    comprobante: {
        type: String,
        required: false
    },
    fechaVencimiento: {
        type: Date,
        required: true
    }
});

const reservaSchema = new mongoose.Schema({
    usuarioCliente: {
        type: String,
        required: true
    },
    equipo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productos",
        required: true
    },
    canje: canjeSchema,
    fecha: {
        type: Date,
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