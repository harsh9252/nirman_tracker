const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/auth');

// All routes require authentication
router.use(verifyToken);

router.post('/', transactionController.createTransaction);
router.get('/project/:projectId', transactionController.getProjectTransactions);
router.get('/project/:projectId/summary', transactionController.getProjectFinancialSummary);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
