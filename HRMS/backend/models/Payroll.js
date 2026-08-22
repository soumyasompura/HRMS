const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee_id: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basic_salary: Number,
  allowances: Number,
  deductions: Number,
  net_salary: Number,
  payment_status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  effective_from: Date,
}, { timestamps: { createdAt: false, updatedAt: 'updated_at' } });

module.exports = mongoose.model('Payroll', payrollSchema);