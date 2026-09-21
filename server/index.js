// Load environment variables from .env
import 'dotenv/config';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Import your Student, Alert, and User models
import Student from './models/Student.js';
import Alert from './models/Alert.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

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

// ROUTE: Create a new alert (WRITE to database)
app.post('/api/alerts', async (req, res) => {
  try {
    const newAlert = new Alert(req.body);
    const savedAlert = await newAlert.save();
    res.status(201).json(savedAlert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Register a new user (signup)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', username: newUser.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Login an existing user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
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

// ROUTE: Get all alerts WITH full student details populated
// This demonstrates the relationship between Alert and Student entities -
// instead of just returning the student's ObjectId, Mongoose's populate()
// replaces it with the actual student document (name, rollNumber, attendance, etc.)
app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = await Alert.find().populate('student');
    res.status(200).json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Get a single alert by ID WITH full student details populated
app.get('/api/alerts/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate('student');
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.status(200).json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Update a student's details by ID (UPDATE in database)
app.put('/api/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ROUTE: Mark an alert as resolved by ID (UPDATE in database)
app.put('/api/alerts/:id/resolve', async (req, res) => {
  try {
    const updatedAlert = await Alert.findByIdAndUpdate(
      req.params.id,
      { resolved: true },
      { new: true }
    );
    if (!updatedAlert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.status(200).json(updatedAlert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});