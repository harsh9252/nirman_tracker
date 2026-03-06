const db = require('../config/database');

class Transaction {
  static create(transactionData, callback) {
    const query = `
      INSERT INTO transactions (
        project_id, type, party_name, amount, payment_method, 
        bank_account, cost_code, reference_no, date, description, created_by,
        attachment, attachment_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      transactionData.project_id,
      transactionData.type,
      transactionData.party_name,
      transactionData.amount,
      transactionData.payment_method || 'cash',
      transactionData.bank_account || null,
      transactionData.cost_code || null,
      transactionData.reference_no || null,
      transactionData.date,
      transactionData.description || null,
      transactionData.created_by || null,
      transactionData.attachment || null,
      transactionData.attachment_name || null
    ];

    db.query(query, values, callback);
  }

  static findByProjectId(projectId, callback) {
    const query = 'SELECT * FROM transactions WHERE project_id = ? ORDER BY date DESC, created_at DESC';
    db.query(query, [projectId], callback);
  }

  static findById(id, callback) {
    const query = 'SELECT * FROM transactions WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }

  static update(id, transactionData, callback) {
    const query = `
      UPDATE transactions SET 
        type = ?, party_name = ?, amount = ?, payment_method = ?, 
        bank_account = ?, cost_code = ?, reference_no = ?, 
        date = ?, description = ?, attachment = ?, attachment_name = ?
      WHERE id = ?
    `;

    const values = [
      transactionData.type,
      transactionData.party_name,
      transactionData.amount,
      transactionData.payment_method,
      transactionData.bank_account,
      transactionData.cost_code,
      transactionData.reference_no,
      transactionData.date,
      transactionData.description,
      transactionData.attachment || null,
      transactionData.attachment_name || null,
      id
    ];

    db.query(query, values, callback);
  }

  static delete(id, callback) {
    const query = 'DELETE FROM transactions WHERE id = ?';
    db.query(query, [id], callback);
  }

  static getStatsByProjectId(projectId, callback) {
    const query = `
      SELECT 
        type, 
        SUM(amount) as total_amount 
      FROM transactions 
      WHERE project_id = ? 
      GROUP BY type
    `;
    db.query(query, [projectId], callback);
  }
}

module.exports = Transaction;
