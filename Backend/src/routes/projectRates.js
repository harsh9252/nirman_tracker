const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const projectRateController = require('../controllers/projectRateController');

router.use(verifyToken);

router.post('/', projectRateController.upsertRate);
router.get('/employee/:employeeId', projectRateController.getRatesByEmployee);
router.delete('/:id', projectRateController.deleteRate);

module.exports = router;
