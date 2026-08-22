const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employee_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  phone: String,
  address: String,
  department: String,
  designation: String,
  joining_date: Date,
  dob: Date,
  gender: String,
  blood_group: String,
  nationality: String,
  marital_status: String,
  emergency_contact_name: String,
  emergency_contact_phone: String,
  profile_picture: String,
  two_factor_secret: String,
  last_login: Date,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);