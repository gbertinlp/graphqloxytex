const mongoose = require('mongoose');

const ProviderSchema = mongoose.Schema({
    nombre: {
        type: String,
        trim: true
    },
    apellido: {
        type: String,
        trim: true
    },
    ruc: {
        type: String,
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    distrito: {
        type: String,
        trim: true
    },
    provincia: {
        type: String,
        trim: true
    },
    departamento: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    telefono: {
        type: String,
        trim: true,
    },
    creado: {
        type: Date,
        default: Date.now()
    },
    promotor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
})

module.exports = mongoose.model('Provider', ProviderSchema);