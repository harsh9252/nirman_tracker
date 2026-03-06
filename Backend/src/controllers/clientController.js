const Client = require('../models/Client');

class ClientController {
    // Get all clients
    static getAllClients(req, res) {
        Client.getAll((err, results) => {
            if (err) {
                console.error('Error fetching clients:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    }

    // Create client
    static createClient(req, res) {
        const clientData = req.body;
        Client.create(clientData, (err, result) => {
            if (err) {
                console.error('Error creating client:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({
                message: 'Client created successfully',
                clientId: result.insertId
            });
        });
    }

    // Get client by ID
    static getClientById(req, res) {
        const { id } = req.params;

        Client.getById(id, (err, results) => {
            if (err) {
                console.error(`Error fetching client with ID ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.json(results[0]);
        });
    }

    // Update client
    static updateClient(req, res) {
        const { id } = req.params;
        const clientData = req.body;

        Client.update(id, clientData, (err, result) => {
            if (err) {
                console.error(`Error updating client with ID ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.json({ message: 'Client updated successfully' });
        });
    }

    // Delete client
    static deleteClient(req, res) {
        const { id } = req.params;

        Client.delete(id, (err, result) => {
            if (err) {
                console.error(`Error deleting client with ID ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Client not found' });
            }

            res.json({ message: 'Client deleted successfully' });
        });
    }
}

module.exports = ClientController;
