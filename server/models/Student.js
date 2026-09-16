import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  attendance: Number,
  // add more fields here if your app needs them, e.g.:
  // internalMarks: Number,
  // assignmentsSubmitted: Number,
  // participationScore: Number,
});

export default mongoose.model('Student', studentSchema);