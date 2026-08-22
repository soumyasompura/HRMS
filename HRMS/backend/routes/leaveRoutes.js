// routes/leaveRoutes.js
const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves, getAllLeaves, approveLeave, rejectLeave } = require('../controllers/leaveController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/apply', verifyToken, applyLeave);
router.get('/my', verifyToken, getMyLeaves);
router.get('/all', verifyToken, isAdmin, getAllLeaves);
router.put('/:id/approve', verifyToken, isAdmin, approveLeave);
router.put('/:id/reject', verifyToken, isAdmin, rejectLeave);

module.exports = router;