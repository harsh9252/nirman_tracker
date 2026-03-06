const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const payrollController = require('../controllers/payrollController');

router.use(verifyToken);

router.post('/generate-slip', payrollController.generateSalarySlip);
router.get('/slips/employee/:employeeId', payrollController.getSalarySlips);
router.get('/slips/project/:projectId', payrollController.getSalarySlipsByProject);
router.post('/record-payment', payrollController.recordPayment);
router.get('/payments/slip/:slipId', payrollController.getPaymentsBySlip);

module.exports = router;
