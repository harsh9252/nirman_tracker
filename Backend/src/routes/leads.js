const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/leadController');

// Lead routes
router.get('/', LeadController.getAllLeads);
router.get('/:id', LeadController.getLeadById);
router.post('/', LeadController.createLead);
router.put('/:id', LeadController.updateLead);
router.delete('/:id', LeadController.deleteLead);

// Convert lead to client
router.post('/:id/convert', LeadController.convertToClient);

module.exports = router;
