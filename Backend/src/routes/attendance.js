const express = require('express');
const router = express.Namespace ? express.Namespace() : express.Router();
const attendanceController = require('../controllers/attendanceController');

// Record attendance (Single or Bulk)
router.post('/record', attendanceController.recordAttendance);

// Get attendance for a project by date
router.get('/project/:projectId/date/:date', attendanceController.getAttendanceByDate);

// Get attendance for a project by date range
router.get('/project/:projectId/range', attendanceController.getAttendanceByRange);

// Get attendance summary for a project
router.get('/project/:projectId/summary', attendanceController.getAttendanceSummary);

module.exports = router;
