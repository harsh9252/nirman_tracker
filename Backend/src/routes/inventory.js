const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/', inventoryController.createEntry);
router.post('/usage-return', inventoryController.createUsageReturn);
router.get('/project/:projectId', inventoryController.getProjectInventory);
router.get('/project/:projectId/summary', inventoryController.getStockSummary);

module.exports = router;
