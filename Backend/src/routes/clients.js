const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

// Get all clients
router.get('/', verifyToken, checkPermission('clients', 'view'), ClientController.getAllClients);

// Create client
router.post('/', verifyToken, checkPermission('clients', 'create'), ClientController.createClient);

// Get client by ID
router.get('/:id', verifyToken, checkPermission('clients', 'view'), ClientController.getClientById);

// Update client
router.put('/:id', verifyToken, checkPermission('clients', 'edit'), ClientController.updateClient);

// Delete client
router.delete('/:id', verifyToken, checkPermission('clients', 'delete'), ClientController.deleteClient);

module.exports = router;
