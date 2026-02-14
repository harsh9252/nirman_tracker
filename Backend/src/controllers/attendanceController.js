const Attendance = require('../models/Attendance');

// Record or update attendance
exports.recordAttendance = (req, res) => {
    const attendanceData = req.body; // Can be a single object or an array

    if (Array.isArray(attendanceData)) {
        // Bulk record
        let processedCount = 0;
        let errors = [];

        attendanceData.forEach(item => {
            Attendance.record(item, (err, result) => {
                processedCount++;
                if (err) errors.push(err);

                if (processedCount === attendanceData.length) {
                    if (errors.length > 0) {
                        return res.status(500).json({
                            message: 'Some records failed',
                            errorCount: errors.length,
                            errors: errors.map(e => e.message)
                        });
                    }
                    res.status(200).json({ message: 'Attendance recorded successfully' });
                }
            });
        });
    } else {
        // Single record
        Attendance.record(attendanceData, (err, result) => {
            if (err) {
                console.error('Error recording attendance:', err);
                return res.status(500).json({ error: 'Failed to record attendance' });
            }
            res.status(200).json({ message: 'Attendance recorded successfully' });
        });
    }
};

// Get attendance for a project by date
exports.getAttendanceByDate = (req, res) => {
    const { projectId, date } = req.params;
    Attendance.getByProjectAndDate(projectId, date, (err, results) => {
        if (err) {
            console.error('Error fetching attendance:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance' });
        }
        res.json(results);
    });
};

// Get attendance for a project by range
exports.getAttendanceByRange = (req, res) => {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
    }

    Attendance.getByProjectAndRange(projectId, startDate, endDate, (err, results) => {
        if (err) {
            console.error('Error fetching attendance range:', err);
            return res.status(500).json({ error: 'Failed to fetch attendance' });
        }
        res.json(results);
    });
};

// Get attendance summary for a project
exports.getAttendanceSummary = (req, res) => {
    const { projectId } = req.params;
    const { startDate, endDate } = req.query;

    Attendance.getSummaryByProject(projectId, startDate, endDate, (err, results) => {
        if (err) {
            console.error('Error fetching attendance summary:', err);
            return res.status(500).json({ error: 'Failed to fetch summary' });
        }
        res.json(results);
    });
};
