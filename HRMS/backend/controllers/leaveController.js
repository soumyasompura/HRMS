// controllers/leaveController.js
const db = require('../config/db');

// Employee applies for leave
async function applyLeave(req, res) {
  try {
    const employee_id = req.user.userId; // numeric id from users table
    const { leave_type, start_date, end_date, reason } = req.body;

    const start = new Date(start_date);
    const end = new Date(end_date);
    const daysRequested = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const year = start.getFullYear();

    if (leave_type !== 'unpaid') {
      let [balRows] = await db.query(
        'SELECT * FROM leave_balances WHERE employee_id = ? AND year = ?',
        [employee_id, year]
      );

      if (balRows.length === 0) {
        await db.query(
          `INSERT INTO leave_balances (employee_id, year, paid_leave_total, paid_leave_used, sick_leave_total, sick_leave_used, unpaid_leave_used)
           VALUES (?, ?, 24, 0, 7, 0, 0)`,
          [employee_id, year]
        );
        [balRows] = await db.query(
          'SELECT * FROM leave_balances WHERE employee_id = ? AND year = ?',
          [employee_id, year]
        );
      }

      const balance = balRows[0];

      if (leave_type === 'paid') {
        const remaining = balance.paid_leave_total - balance.paid_leave_used;
        if (daysRequested > remaining) {
          return res.status(400).json({ message: `Insufficient paid leave balance. Remaining: ${remaining} days` });
        }
      }

      if (leave_type === 'sick') {
        const remaining = balance.sick_leave_total - balance.sick_leave_used;
        if (daysRequested > remaining) {
          return res.status(400).json({ message: `Insufficient sick leave balance. Remaining: ${remaining} days` });
        }
      }
    }

    await db.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [employee_id, leave_type, start_date, end_date, reason]
    );

    res.status(201).json({ message: 'Leave request submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Error applying for leave', error: err.message });
  }
}

// Employee views own leave history
async function getMyLeaves(req, res) {
  try {
    const employee_id = req.user.userId;
    const [leaves] = await db.query(
      'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC',
      [employee_id]
    );
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave requests', error: err.message });
  }
}

// Admin views ALL leave requests
async function getAllLeaves(req, res) {
  try {
    const [leaves] = await db.query('SELECT * FROM leave_requests ORDER BY created_at DESC');
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave requests', error: err.message });
  }
}

// Admin approves a leave request
async function approveLeave(req, res) {
  try {
    const { id } = req.params;
    const { hr_comment } = req.body;
    const approverId = req.user.userId;

    const [rows] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    const leaveRequest = rows[0];

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    await db.query(
      'UPDATE leave_requests SET status = ?, hr_comment = ?, approved_by = ? WHERE id = ?',
      ['approved', hr_comment || '', approverId, id]
    );

    const start = new Date(leaveRequest.start_date);
    const end = new Date(leaveRequest.end_date);
    const daysUsed = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const year = start.getFullYear();

    if (leaveRequest.leave_type === 'paid') {
      await db.query(
        'UPDATE leave_balances SET paid_leave_used = paid_leave_used + ? WHERE employee_id = ? AND year = ?',
        [daysUsed, leaveRequest.employee_id, year]
      );
    } else if (leaveRequest.leave_type === 'sick') {
      await db.query(
        'UPDATE leave_balances SET sick_leave_used = sick_leave_used + ? WHERE employee_id = ? AND year = ?',
        [daysUsed, leaveRequest.employee_id, year]
      );
    } else if (leaveRequest.leave_type === 'unpaid') {
      await db.query(
        'UPDATE leave_balances SET unpaid_leave_used = unpaid_leave_used + ? WHERE employee_id = ? AND year = ?',
        [daysUsed, leaveRequest.employee_id, year]
      );
    }

    res.json({ message: 'Leave approved' });
  } catch (err) {
    res.status(500).json({ message: 'Error approving leave', error: err.message });
  }
}

// Admin rejects a leave request
async function rejectLeave(req, res) {
  try {
    const { id } = req.params;
    const { hr_comment } = req.body;
    const approverId = req.user.userId;

    const [rows] = await db.query('SELECT * FROM leave_requests WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    await db.query(
      'UPDATE leave_requests SET status = ?, hr_comment = ?, approved_by = ? WHERE id = ?',
      ['rejected', hr_comment || '', approverId, id]
    );

    res.json({ message: 'Leave rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting leave', error: err.message });
  }
}

module.exports = { applyLeave, getMyLeaves, getAllLeaves, approveLeave, rejectLeave };