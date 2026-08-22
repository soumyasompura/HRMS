const mongoose = require('mongoose');

const workUpdateSchema = new mongoose.Schema({
  employee_id: { type: String, required: true },
  project: String,
  work_title: String,
  description: String,
  work_date: Date,
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  progress_percentage: { type: Number, default: 0 },
  remarks: String,
  completed_at: Date,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('WorkUpdate', workUpdateSchema);