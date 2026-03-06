const express = require('express');
const router = express.Router();
const materialRequestController = require('../controllers/materialRequestController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/', materialRequestController.createRequest);
router.get('/my-requests', materialRequestController.getMyRequests);
router.get('/project/:projectId', materialRequestController.getProjectRequests);
router.patch('/:id/status', materialRequestController.updateStatus);
router.delete('/:id', materialRequestController.deleteRequest);

module.exports = router;
