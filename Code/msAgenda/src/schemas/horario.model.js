const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
    vendedor: {
        type: String,
        required: true
    },
    sucursal: {
        type: String,
        required: true
    },
    diaSemana: {
        type: String,
        required: true,
        enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    },
    horaInicio: { // 24h clock
        type: Number,
        min: 0,
        max: 23,
        required: true
    },
    horaFinal: {
        type: Number,
        min: 0,
        max: 23,
        required: true
    },    
});

// Número del día de la semana seleccionado
horarioSchema.methods.getNroDiaSemana = function() {
    const daysMap = {
        'Lunes': 1,
        'Martes': 2,
        'Miércoles': 3,
        'Jueves': 4,
        'Viernes': 5,
        'Sábado': 6,
        'Domingo': 7
    };
    return daysMap[this.diaSemana] || null;
};

module.exports = mongoose.model('horario', horarioSchema);