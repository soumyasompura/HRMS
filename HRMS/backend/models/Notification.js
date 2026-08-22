const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  title: String,
  message: String,
  type: String,
  is_read: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Notification', notificationSchema);