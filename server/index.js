// Load environment variables from .env
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Import your Student model
import Student from './models/Student.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // lets us read JSON from request bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// ROUTE 1: Create a new student (WRITE to database)
app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 2: Get all students (READ from database)
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 3: Get a single student by ID (READ from database)
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 4: Get students below a given attendance threshold (at-risk students)
app.get('/api/students/at-risk/:threshold', async (req, res) => {
  try {
    const threshold = Number(req.params.threshold);
    const atRiskStudents = await Student.find({ attendance: { $lt: threshold } });
    res.status(200).json(atRiskStudents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE 5: Get total count of students in the database
app.get('/api/students/count/total', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.status(200).json({ totalStudents: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});