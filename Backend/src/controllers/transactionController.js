const Transaction = require('../models/Transaction');

const transactionController = {
    createTransaction: (req, res) => {
        const transactionData = {
            ...req.body,
            created_by: req.user.id // Assuming req.user is populated by auth middleware
        };

        Transaction.create(transactionData, (err, result) => {
            if (err) {
                console.error('Error creating transaction:', err);
                return res.status(500).json({ error: 'Failed to create transaction' });
            }
            res.status(201).json({ message: 'Transaction created successfully', id: result.insertId });
        });
    },

    getProjectTransactions: (req, res) => {
        const { projectId } = req.params;
        Transaction.findByProjectId(projectId, (err, results) => {
            if (err) {
                console.error('Error fetching transactions:', err);
                return res.status(500).json({ error: 'Failed to fetch transactions' });
            }
            res.json(results);
        });
    },

    updateTransaction: (req, res) => {
        const { id } = req.params;
        Transaction.update(id, req.body, (err, result) => {
            if (err) {
                console.error('Error updating transaction:', err);
                return res.status(500).json({ error: 'Failed to update transaction' });
            }
            res.json({ message: 'Transaction updated successfully' });
        });
    },

    deleteTransaction: (req, res) => {
        const { id } = req.params;
        Transaction.delete(id, (err, result) => {
            if (err) {
                console.error('Error deleting transaction:', err);
                return res.status(500).json({ error: 'Failed to delete transaction' });
            }
            res.json({ message: 'Transaction deleted successfully' });
        });
    },

    getProjectFinancialSummary: (req, res) => {
        const { projectId } = req.params;
        Transaction.getStatsByProjectId(projectId, (err, results) => {
            if (err) {
                console.error('Error fetching financial summary:', err);
                return res.status(500).json({ error: 'Failed to fetch financial summary' });
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
            // This is a simplified calculation
            summary.netMargin = summary.paymentIn - (summary.paymentOut + summary.materialPurchase - summary.materialReturn);

            res.json(summary);
        });
    }
};

module.exports = transactionController;
