const MaterialInventory = require('../models/MaterialInventory');
const db = require('../config/database');

const inventoryController = {
    createEntry: (req, res) => {
        const data = {
            ...req.body,
            created_by: req.user.id
        };

        MaterialInventory.create(data, (err, result) => {
            if (err) {
                console.error('Error creating inventory entry:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ id: result.insertId, message: 'Inventory entry created' });
        });
    },

    getProjectInventory: (req, res) => {
        const { projectId } = req.params;
        MaterialInventory.findByProjectId(projectId, (err, results) => {
            if (err) {
                console.error('Error fetching inventory for project:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    },

    getStockSummary: (req, res) => {
        const { projectId } = req.params;
        MaterialInventory.getStockSummary(projectId, (err, results) => {
            if (err) {
                console.error('Error fetching stock summary:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    },

    createUsageReturn: (req, res) => {
        const { related_id, quantity, transaction_date, description } = req.body;

        if (!related_id || !quantity) {
            return res.status(400).json({ error: 'Related issue ID and quantity are required' });
        }

        // 1. Find the original issue
        MaterialInventory.findById(related_id, (err, originalIssue) => {
            if (err) return res.status(500).json({ error: 'Internal server error' });
            if (!originalIssue || originalIssue.type !== 'Out') {
                return res.status(404).json({ error: 'Original material issue not found' });
            }

            // 2. Check how much has already been returned
            MaterialInventory.getReturnedQuantityForIssue(related_id, (err, alreadyReturned) => {
                if (err) return res.status(500).json({ error: 'Internal server error' });

                const totalPossibleReturn = originalIssue.quantity - alreadyReturned;

                if (quantity > totalPossibleReturn) {
                    return res.status(400).json({
                        error: `Return quantity (${quantity}) exceeds remaining issued quantity (${totalPossibleReturn})`
                    });
                }

                // 3. Create the return entry
                const data = {
                    project_id: originalIssue.project_id,
                    material_name: originalIssue.material_name,
                    quantity: quantity,
                    unit: originalIssue.unit,
                    type: 'Usage_Return',
                    transaction_date: transaction_date || new Date(),
                    description: description || `Return from issue #${related_id}`,
                    created_by: req.user.id,
                    related_id: related_id
                };

                const query = `
                    INSERT INTO material_inventory (
                        project_id, material_name, quantity, unit, type, 
                        transaction_date, description, created_by, related_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    data.project_id, data.material_name, data.quantity, data.unit, data.type,
                    data.transaction_date, data.description, data.created_by, data.related_id
                ];

                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error('Error creating usage return entry:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.status(201).json({ id: result.insertId, message: 'Usage return recorded successfully' });
                });
            });
        });
    }
};

module.exports = inventoryController;
