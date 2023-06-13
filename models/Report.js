const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
    code: {
        type: String,
    },
    order: {
        type: Array,
        required: true,
    },
    topay: {
        type: Number,
        required: true,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Client'
    },
    promotor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    status: {
        type: String
    },
    creado: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Report', ReportSchema);