const mongoose = require('mongoose');
const { getCachedColorMap } = require('../utils/ColorCache');

const EquipoSchema = new mongoose.Schema({
    producto: { // NO EDITABLE
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productos',
        required: true
    },
    imagenes: {
        type: [String], // Array of URLs
        required: false,
        validate: {
            validator: function(v) {
                return !v || v.length <= 5;
            },
            message: 'Máximo 5 imágenes por equipo'
        }
    },
    condicionBateria: { // EDITABLE
        type: Number,
        required: false,
        min: [0, 'El porcentaje de batería debe ser igual o mayor a cero'],
        max: [1, 'El porcentaje de batería debe ser iual o menor a 100']
    },
    condicion: { // NO EDITABLE
        type: String,        
        enum: ['Sellado', 'Usado', 'ASIS', 'OEM', 'CPO'],
        required: true
    },
    grado: { // EDITABLE
        type: String,
        enum: ['A+', 'A', 'A-'],
        required: false
    },
    estado: { //EDITABLE
        type: String,
        enum: ['En Stock', 'Pedido', 'Reservado', 'Vendido', 'Baja', "A pedido"],
        required: true
    },
    costo: { // EDITABLE
        type: Number,
        min: [0, 'El costo debe ser igual o mayor a cero'],
        required: true
    },
    precio: { // EDITABLE
        type: Number,
        min: [0, 'El precio debe ser mayor a cero'],
        required: true
    },
    detalles: { // EDITABLE
        type: [String],
        required: false
    },
    accesorios: { // EDITABLE
        type: [String],
        enum: ['Caja', 'Cable', 'Templado', 'Funda', 'Cargador'],
        required: false
    },
    color: { // NO EDITABLE
        type: mongoose.Schema.Types.ObjectId,
        ref: 'colores',
        required: true,
        validate: {
            validator: async function(value) {
                const colorMap = await getCachedColorMap();
                const validColorIds = new Set(colorMap.values());

                return validColorIds.has(value.toString());
            },
            message: 'El color seleccionado es inválido.'
        }
    },
    garantiaApple: { // EDITABLE
        type: Date,
        required: false
    },
    garantiaPropia: { // EDITABLE
        type: String,
        enum: ['30 días', '60 días', '90 días'],
        required: false
    },
    ubicacion: { // EDITABLE
        type: String,
        required: true,
        enum: ['La Rioja', 'CABA']
    },
    canjeable: { // EDITABLE
        type: Boolean,
        required: true
    }
});

// Validar que el equipo tenga al menos una garantía pero no ambas
EquipoSchema.pre('validate', function (next) {
    const hasApple = !!this.garantiaApple;
    const hasOwn = !!this.garantiaPropia || this.garantiaPropia === '';

    if((hasApple && hasOwn)||(!hasApple && !hasOwn)) {
        return next(new Error('Debe definir sólo uno de los campos: Garantía Apple o Garantía propia'));
    }
    next();
});

module.exports = mongoose.model('equipos', EquipoSchema);