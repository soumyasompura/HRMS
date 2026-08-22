// controllers/payrollController.js
const db = require('../config/db');

// Admin creates or updates payroll for an employee for a given month/year
async function setPayroll(req, res) {
  try {
    const { employee_id, month, year, basic_salary, allowances, deductions, effective_from } = req.body;
    const net_salary = Number(basic_salary) + Number(allowances || 0) - Number(deductions || 0);

    const [existing] = await db.query(
      'SELECT * FROM payroll WHERE employee_id = ? AND month = ? AND year = ?',
      [employee_id, month, year]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE payroll SET basic_salary = ?, allowances = ?, deductions = ?, net_salary = ?, effective_from = ?
         WHERE employee_id = ? AND month = ? AND year = ?`,
        [basic_salary, allowances, deductions, net_salary, effective_from, employee_id, month, year]
      );
      return res.json({ message: 'Payroll updated' });
    }

    await db.query(
      `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_status, effective_from)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [employee_id, month, year, basic_salary, allowances, deductions, net_salary, effective_from]
    );

    res.status(201).json({ message: 'Payroll created' });
  } catch (err) {
    res.status(500).json({ message: 'Error setting payroll', error: err.message });
  }
}

// Admin marks a payroll record as paid
async function markAsPaid(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM payroll WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    await db.query('UPDATE payroll SET payment_status = ? WHERE id = ?', ['paid', id]);
    res.json({ message: 'Marked as paid' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment status', error: err.message });
  }
}

// Employee views their own payroll history (read-only)
async function getMyPayroll(req, res) {
  try {
    const employee_id = req.user.userId;
    const [records] = await db.query(
      'SELECT * FROM payroll WHERE employee_id = ? ORDER BY year DESC, month DESC',
      [employee_id]
    );
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payroll', error: err.message });
  }
}

// Admin views payroll for a specific employee
async function getEmployeePayroll(req, res) {
  try {
    const { employee_id } = req.params;
    const [records] = await db.query(
      'SELECT * FROM payroll WHERE employee_id = ? ORDER BY year DESC, month DESC',
      [employee_id]
    );
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payroll', error: err.message });
  }
}

// Admin views ALL payroll records (optionally filtered by month/year)
async function getAllPayroll(req, res) {
  try {
    const { month, year } = req.query;
    let records;

    if (month && year) {
      [records] = await db.query(
        'SELECT * FROM payroll WHERE month = ? AND year = ? ORDER BY employee_id',
        [month, year]
      );
    } else {
      [records] = await db.query('SELECT * FROM payroll ORDER BY employee_id');
    }

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payroll', error: err.message });
  }
}

module.exports = { setPayroll, markAsPaid, getMyPayroll, getEmployeePayroll, getAllPayroll };