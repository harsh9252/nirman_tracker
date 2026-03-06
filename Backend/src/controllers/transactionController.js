const Transaction = require('../models/Transaction');

const transactionController = {
    createTransaction: (req, res) => {
        const transactionData = {
            ...req.body,
            created_by: req.user.id
        };

        if (req.file) {
            transactionData.attachment = req.file.path.replace(/\\/g, '/');
            transactionData.attachment_name = req.file.originalname;
        }

        Transaction.create(transactionData, (err, result) => {
            if (err) {
                console.error('Error creating transaction:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ message: 'Transaction created successfully', id: result.insertId });
        });
    },

    getProjectTransactions: (req, res) => {
        const { projectId } = req.params;
        Transaction.findByProjectId(projectId, (err, results) => {
            if (err) {
                console.error(`Error fetching transactions for project ${projectId}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    },

    updateTransaction: (req, res) => {
        const { id } = req.params;
        const transactionData = { ...req.body };

        if (req.file) {
            transactionData.attachment = req.file.path.replace(/\\/g, '/');
            transactionData.attachment_name = req.file.originalname;
        }

        Transaction.update(id, transactionData, (err, result) => {
            if (err) {
                console.error(`Error updating transaction ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Transaction updated successfully' });
        });
    },

    deleteTransaction: (req, res) => {
        const { id } = req.params;
        Transaction.delete(id, (err, result) => {
            if (err) {
                console.error(`Error deleting transaction ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Transaction deleted successfully' });
        });
    },

    getProjectFinancialSummary: (req, res) => {
        const { projectId } = req.params;
        Transaction.getStatsByProjectId(projectId, (err, results) => {
            if (err) {
                console.error(`Error fetching financial summary for project ${projectId}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Process stats into a summary
            const summary = {
                paymentIn: 0,
                paymentOut: 0,
                materialPurchase: 0,
                materialReturn: 0,
                cashFlow: 0,
                netMargin: 0
            };

            results.forEach(row => {
                const amount = parseFloat(row.total_amount) || 0;
                switch (row.type) {
                    case 'Payment In':
                        summary.paymentIn = amount;
                        break;
                    case 'Payment Out':
                        summary.paymentOut = amount;
                        break;
                    case 'Material Purchase':
                        summary.materialPurchase = amount;
                        break;
                    case 'Material Return':
                        summary.materialReturn = amount;
                        break;
                }
            });

            summary.cashFlow = summary.paymentIn - summary.paymentOut;
            // Net Margin = Payment In (Revenue) - Payment Out (Expenses) - Material Purchase (Expenses) + Material Return (Credit)
            summary.netMargin = summary.paymentIn - (summary.paymentOut + summary.materialPurchase - summary.materialReturn);

            res.json(summary);
        });
    }
};

module.exports = transactionController;
