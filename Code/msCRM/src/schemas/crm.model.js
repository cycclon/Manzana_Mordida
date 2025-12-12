const mongoose = require('mongoose');

const CRM_ESTADOS = [
    'Nuevo lead',
    'Interesado',
    'En evaluación',
    'Negociación/Cierre',
    'Venta concretada/Postventa',
    'Lead frío',
    'Perdido'
];

const REDES_SOCIALES = [
    'Instagram',
    'Facebook',
    'WhatsApp',
    'Teléfono',
    'Email',
    'Presencial',
    'Web',
    'Otro'
];

const crmSchema = new mongoose.Schema({
    usuario: {
        type: String,
        required: true,
        trim: true
    },
    redSocial: {
        type: String,
        required: true,
        enum: REDES_SOCIALES
    },
    idRedSocial: {
        type: String,
        required: false,
        trim: true
    },
    nombres: {
        type: String,
        required: false,
        trim: true
    },
    apellidos: {
        type: String,
        required: false,
        trim: true
    },
    telefono: {
        type: String,
        required: false,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    estado: {
        type: String,
        required: true,
        enum: CRM_ESTADOS,
        default: 'Nuevo lead'
    },
    historialEstados: [{
        estado: {
            type: String,
            enum: CRM_ESTADOS
        },
        fecha: {
            type: Date,
            default: Date.now
        },
        notas: String
    }],
    intereses: {
        type: String,
        required: false,
        trim: true
    },
    equipoComprado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipo',
        required: false
    },
    equipoCompradoDescripcion: {
        type: String,
        required: false
    },
    requiereHumano: {
        type: Boolean,
        required: true,
        default: false
    },
    notas: {
        type: String,
        required: false
    },
    fechaUltimoContacto: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for unique user per social network
crmSchema.index({ usuario: 1, redSocial: 1 }, { unique: true });

// Index for common queries
crmSchema.index({ estado: 1 });
crmSchema.index({ redSocial: 1 });
crmSchema.index({ requiereHumano: 1 });
crmSchema.index({ fechaUltimoContacto: -1 });

module.exports = mongoose.model('CRM', crmSchema);
module.exports.CRM_ESTADOS = CRM_ESTADOS;
module.exports.REDES_SOCIALES = REDES_SOCIALES;