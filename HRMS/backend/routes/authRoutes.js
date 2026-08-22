// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerEmployee, login } = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST /api/auth/register -> only an admin can create a new employee
router.post('/register', verifyToken, isAdmin, registerEmployee);

// POST /api/auth/login -> anyone can attempt login
router.post('/login', login);

module.exports = router;