const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNumber: { type: String, required: true, unique: true },
  grade: { type: String, required: true },
  attendancePercentage: { type: Number, default: 100 },
  averageGrade: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);