const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  action: String,
  target_type: String,
  target_id: String,
  description: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('AuditLog', auditLogSchema);