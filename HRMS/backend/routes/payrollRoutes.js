// routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const { setPayroll, markAsPaid, getMyPayroll, getEmployeePayroll, getAllPayroll } = require('../controllers/payrollController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/set', verifyToken, isAdmin, setPayroll);
router.put('/:id/paid', verifyToken, isAdmin, markAsPaid);
router.get('/my', verifyToken, getMyPayroll);
router.get('/employee/:employee_id', verifyToken, isAdmin, getEmployeePayroll);
router.get('/all', verifyToken, isAdmin, getAllPayroll);

module.exports = router;