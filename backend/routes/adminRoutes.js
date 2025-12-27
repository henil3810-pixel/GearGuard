const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, getDashboardStats, getOverdueRequests, getCalendarData, getReports } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.get('/dashboard-stats', protect, admin, getDashboardStats);
router.get('/overdue-requests', protect, admin, getOverdueRequests);
router.get('/calendar', protect, admin, getCalendarData);
router.get('/reports', protect, admin, getReports);

module.exports = router;
