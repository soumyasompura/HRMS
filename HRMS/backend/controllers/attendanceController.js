// controllers/attendanceController.js
const db = require('../config/db');

// Employee checks in - creates today's attendance record
async function checkIn(req, res) {
  try {
    const employee_id = req.user.userId; // numeric id from users table
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const [existing] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    await db.query(
      `INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, NOW(), 'present')`,
      [employee_id, today]
    );

    res.status(201).json({ message: 'Checked in successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Check-in error', error: err.message });
  }
}

// Employee checks out - updates today's record with check_out time + total_hours
async function checkOut(req, res) {
  try {
    const employee_id = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employee_id, today]
    );
    const record = rows[0];

    if (!record) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }
    if (record.check_out) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    await db.query(
      `UPDATE attendance 
       SET check_out = NOW(), total_hours = ROUND(TIMESTAMPDIFF(MINUTE, check_in, NOW()) / 60, 2)
       WHERE id = ?`,
      [record.id]
    );

    res.json({ message: 'Checked out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Check-out error', error: err.message });
  }
}

// Get attendance for logged-in employee (own records only)
async function getMyAttendance(req, res) {
  try {
    const employee_id = req.user.userId;
    const [records] = await db.query(
      'SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC',
      [employee_id]
    );
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
}

// Admin: get attendance for ALL employees, optionally filtered by date
async function getAllAttendance(req, res) {
  try {
    const { date } = req.query;
    let records;

    if (date) {
      [records] = await db.query('SELECT * FROM attendance WHERE date = ? ORDER BY employee_id', [date]);
    } else {
      [records] = await db.query('SELECT * FROM attendance ORDER BY date DESC');
    }

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance', error: err.message });
  }
}

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance };