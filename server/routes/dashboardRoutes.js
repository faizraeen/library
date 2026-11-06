const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getStudentDashboard,
  getRegisteredStudents,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/student', protect, getStudentDashboard);
router.get('/students', protect, authorize('admin'), getRegisteredStudents);

module.exports = router;
