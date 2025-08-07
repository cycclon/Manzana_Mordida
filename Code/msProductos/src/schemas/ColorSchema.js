const mongoose = require("mongoose");

const ColorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    hex: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('colores', ColorSchema);