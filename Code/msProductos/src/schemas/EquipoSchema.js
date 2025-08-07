const mongoose = require('mongoose');

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
        enum: ['En Stock', 'Pedido', 'Reservado', 'Vendido', 'Baja'],
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
    }
});