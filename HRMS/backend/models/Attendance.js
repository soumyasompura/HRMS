const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee_id: { type: String, required: true },
  date: { type: Date, required: true },
  check_in: Date,
  check_out: Date,
  total_hours: Number,
  status: { type: String, enum: ['present', 'absent', 'halfday', 'leave'] },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Attendance', attendanceSchema);