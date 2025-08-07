const mongoose = require("mongoose");
const { getCachedColorIds } = require("../utils/ColorCache");

const ProductoSchema = new mongoose.Schema({
    marca: {
        type: String,
        required: true,
        default: "Apple"
    },
    linea: {
        type: String,
        required: true,
        enum: ["iPhone", "MacBook", "iPad", "Watch", "AirPod"]
    },
    modelo: {
        type: String,
        required: true,
        unique: true
    },
    colores: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'colores',
        validate: {
            validator: async function(value) {
                const validColorIds = await getCachedColorIds();
                return value.every(id => validColorIds.has(id.toString()));
            },
            message: 'Uno o más colores seleccionados son inválidos.'
        }
    },
}); 

module.exports = mongoose.model("productos", ProductoSchema);