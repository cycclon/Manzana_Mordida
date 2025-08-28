const mongoose = require('mongoose');

const precioCanjeSchema = new mongoose.Schema({
    linea: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    bateriaMin: { // número decimal entre 0 y 1
        type: Number,
        required: true
    },
    bateriaMax: { // número decimal entre 0 y 1
        type: Number,
        required: true
    },
    precioCanje: { // Expresado en dólares
        type: Number,
        required: true
    },
});

module.exports = new mongoose.model('precio_canje', precioCanjeSchema);