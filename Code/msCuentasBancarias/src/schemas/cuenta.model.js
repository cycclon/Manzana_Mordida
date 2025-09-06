const mongoose = require('mongoose');

const cuentaSchema = new mongoose.Schema({
    entidad: {
        type: String,
        required: true
    },
    cbu: {
        type: String,
        required: true,
        unique: true,
        min: 22,
        max: 22
    },
    alias:{ 
        type: String,
        required: true,
        unique: true
    },
    titular: {
        type: String,
        required: true,
    },
    monedas: {
        type: [String],
        enum: ['Dólares', 'Pesos'],
        required: true

    }
});

module.exports = mongoose.model('cuenta_bancaria', cuentaSchema);