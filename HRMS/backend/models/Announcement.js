const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  created_by: { type: String, required: true },
  title: { type: String, required: true },
  message: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Announcement', announcementSchema);