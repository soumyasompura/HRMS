// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const generateLoginId = require('../utils/generateLoginId');

// ADMIN creates a new employee account
async function registerEmployee(req, res) {
  try {
    const { name, email, role, department, designation, joining_date, phone, address } = req.body;

    const [firstName, lastName] = name.split(' ');
    const joiningYear = new Date(joining_date).getFullYear();

    // count existing users who joined this year -> serial number
    const [countRows] = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE YEAR(joining_date) = ?',
      [joiningYear]
    );
    const serialNumber = countRows[0].count + 1;

    const employee_id = generateLoginId('OI', firstName, lastName || firstName, joiningYear, serialNumber);

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await db.query(
      `INSERT INTO users (employee_id, name, email, password, role, department, designation, joining_date, phone, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [employee_id, name, email, hashedPassword, role || 'employee', department, designation, joining_date, phone, address]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employee_id,
      tempPassword, // ⚠️ only for testing/demo — remove before real deployment
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating employee', error: err.message });
  }
}

// LOGIN for any user (admin or employee)
async function login(req, res) {
  try {
    const { employee_id, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE employee_id = ?', [employee_id]);
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid login ID or password' });
    }

  const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid login ID or password' });
    }

    // update last_login
    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { userId: user.id, employee_id: user.employee_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        employee_id: user.employee_id,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR DETAILS:', err);
    res.status(500).json({ message: 'Login error', error: err.message });
}
}

module.exports = { registerEmployee, login };