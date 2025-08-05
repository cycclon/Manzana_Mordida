const mongoose = require("mongoose");

const ProductoSchema = new mongoose.Schema({
    marca: String,
    modelo: String,
    colores: [],
}); 

module.exports = mongoose.model("productos", ProductoSchema);