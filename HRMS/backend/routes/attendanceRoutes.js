// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getAllAttendance } = require('../controllers/attendanceController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/checkin', verifyToken, checkIn);
router.post('/checkout', verifyToken, checkOut);
router.get('/my', verifyToken, getMyAttendance);
router.get('/all', verifyToken, isAdmin, getAllAttendance);

module.exports = router;