const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  reason: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  resolved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);