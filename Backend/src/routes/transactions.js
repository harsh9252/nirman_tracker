const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');

// All routes require authentication
router.use(verifyToken);

router.post('/', upload.single('attachment'), transactionController.createTransaction);
router.get('/project/:projectId', transactionController.getProjectTransactions);
router.get('/project/:projectId/summary', transactionController.getProjectFinancialSummary);
router.put('/:id', upload.single('attachment'), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
