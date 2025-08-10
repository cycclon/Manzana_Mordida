const mongoose = require("mongoose");
const { getCachedColorIds, getCachedColorMap } = require("../utils/ColorCache");

const ProductoSchema = new mongoose.Schema({
    marca: { // NO EDITABLE
        type: String,
        required: true,
        default: "Apple"
    },
    linea: { // NO EDITABLE
        type: String,
        required: true,
        enum: ["iPhone", "MacBook", "iPad", "Watch", "AirPods"]
    },
    modelo: { // NO EDITABLE
        type: String,
        required: true,
        unique: true
    },
    colores: { // EDITABLE
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'colores',
        validate: {
            validator: async function(value) {
                const colorMap = await getCachedColorMap();
                const validColorIds = new Set(Array.from(colorMap.values()));
                return value.every(id => validColorIds.has(id.toString()));
            },
            message: 'Uno o más colores seleccionados son inválidos.'
        }
    },
    canjeable: { // EDITABLE
        type: Boolean,
        required: true
    }
}); 

module.exports = mongoose.model("productos", ProductoSchema);