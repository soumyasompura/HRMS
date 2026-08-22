const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee_id: { type: String, required: true },
  leave_type: { type: String, enum: ['paid', 'sick', 'unpaid'], required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  hr_comment: String,
  approved_by: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);