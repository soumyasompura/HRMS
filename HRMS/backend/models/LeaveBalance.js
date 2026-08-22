const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employee_id: { type: String, required: true },
  year: { type: Number, required: true },
  paid_leave_total: { type: Number, default: 24 },
  paid_leave_used: { type: Number, default: 0 },
  sick_leave_total: { type: Number, default: 7 },
  sick_leave_used: { type: Number, default: 0 },
  unpaid_leave_used: { type: Number, default: 0 },
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);