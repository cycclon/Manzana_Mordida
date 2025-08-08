const mongoose = require('mongoose');
const { getCachedColorMap } = require('../utils/ColorCache');

const EquipoSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productos',
        required: true
    },
    condicionBateria: {
        type: Number,
        required: false,
        min: [0, 'El porcentaje de batería debe ser igual o mayor a cero'],
        max: [1, 'El porcentaje de batería debe ser iual o menor a 100']
    },
    condicion: {
        type: String,        
        enum: ['Sellado', 'Usado', 'ASIS', 'OEM', 'CPO'],
        required: true
    },
    grado: {
        type: String,
        enum: ['A+', 'A', 'A-'],
        required: false
    },
    estado: {
        type: String,
        enum: ['En Stock', 'Pedido', 'Reservado', 'Vendido', 'Baja', "A pedido"],
        required: true
    },
    costo: {
        type: Number,
        min: [0, 'El costo debe ser igual o mayor a cero'],
        required: true
    },
    precio: {
        type: Number,
        min: [0, 'El precio debe ser mayor a cero'],
        required: true
    },
    detalles: {
        type: [String],
        required: false
    },
    accesorios: {
        type: [String],
        enum: ['Caja', 'Cable', 'Templado', 'Funda', 'Cargador'],
        required: false
    },
    color: {
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
    garantiaApple: {
        type: Date,
        required: false
    },
    garantiaPropia: {
        type: String,
        enum: ['30 días', '60 días', '90 días'],
        required: false
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