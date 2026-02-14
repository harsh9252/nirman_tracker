const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/clientController');
const { verifyToken } = require('../middlewares/auth');

// Get all clients
router.get('/', verifyToken, ClientController.getAllClients);

// Create client
router.post('/', verifyToken, ClientController.createClient);

// Get client by ID
router.get('/:id', verifyToken, ClientController.getClientById);

// Update client
router.put('/:id', verifyToken, ClientController.updateClient);

// Delete client
router.delete('/:id', verifyToken, ClientController.deleteClient);

module.exports = router;
