// server.js - Main entry point for HRMS backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // allows us to read JSON from request bodies

app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

const leaveRoutes = require('./routes/leaveRoutes');
app.use('/api/leave', leaveRoutes);

const payrollRoutes = require('./routes/payrollRoutes');
app.use('/api/payroll', payrollRoutes);

// Test route - visit http://localhost:5000/ to check server is alive
app.get('/', (req, res) => {
  res.send('HRMS Backend is running ✅');
});

// Test API route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});