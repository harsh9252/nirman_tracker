const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');

const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

// Lead routes
router.get('/', verifyToken, checkPermission('leads', 'view'), LeadController.getAllLeads);
router.get('/:id', verifyToken, checkPermission('leads', 'view'), LeadController.getLeadById);
router.post('/', verifyToken, checkPermission('leads', 'create'), LeadController.createLead);
router.put('/:id', verifyToken, checkPermission('leads', 'edit'), LeadController.updateLead);
router.delete('/:id', verifyToken, checkPermission('leads', 'delete'), LeadController.deleteLead);

// Convert lead to client
router.post('/:id/convert', verifyToken, checkPermission('leads', 'edit'), LeadController.convertToClient);

module.exports = router;
