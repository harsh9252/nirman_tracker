const db = require('../config/database');

class MaterialInventory {
  static create(data, callback) {
    const query = `
      INSERT INTO material_inventory (
        project_id, material_name, quantity, unit, type, 
        transaction_date, description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.project_id,
      data.material_name,
      data.quantity,
      data.unit,
      data.type,
      data.transaction_date,
      data.description || null,
      data.created_by || null
    ];

    db.query(query, values, callback);
  }

  static bulkCreate(entries, callback) {
    if (!entries || entries.length === 0) return callback(null, { affectedRows: 0 });

    const query = `
      INSERT INTO material_inventory (
        project_id, material_name, quantity, unit, type, 
        transaction_date, description, created_by
      ) VALUES ?
    `;

    const values = entries.map(entry => [
      entry.project_id,
      entry.material_name,
      entry.quantity,
      entry.unit,
      entry.type,
      entry.transaction_date,
      entry.description || null,
      entry.created_by || null
    ]);

    db.query(query, [values], callback);
  }

  static findByProjectId(projectId, callback) {
    const query = `
      SELECT mi.*, CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM material_inventory mi
      LEFT JOIN users u ON mi.created_by = u.id
      WHERE mi.project_id = ?
      ORDER BY mi.transaction_date DESC, mi.created_at DESC
    `;
    db.query(query, [projectId], callback);
  }

  static getStockSummary(projectId, callback) {
    const query = `
      SELECT 
        material_name,
        unit,
        SUM(CASE WHEN type = 'In' THEN quantity ELSE 0 END) as total_in,
        SUM(CASE WHEN type = 'Out' THEN quantity ELSE 0 END) as total_out,
        SUM(CASE WHEN type = 'Return' THEN quantity ELSE 0 END) as total_return,
        SUM(CASE WHEN type = 'Usage_Return' THEN quantity ELSE 0 END) as total_usage_return,
        (SUM(CASE WHEN type = 'In' THEN quantity ELSE 0 END) - 
         SUM(CASE WHEN type = 'Out' THEN quantity ELSE 0 END) - 
         SUM(CASE WHEN type = 'Return' THEN quantity ELSE 0 END) +
         SUM(CASE WHEN type = 'Usage_Return' THEN quantity ELSE 0 END)) as current_stock
      FROM material_inventory
      WHERE project_id = ?
      GROUP BY material_name, unit
    `;
    db.query(query, [projectId], callback);
  }

  static getReturnedQuantityForIssue(relatedId, callback) {
    const query = `
            SELECT SUM(quantity) as total_returned 
            FROM material_inventory 
            WHERE related_id = ? AND type = 'Usage_Return'
        `;
    db.query(query, [relatedId], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]?.total_returned || 0);
    });
  }

  static findById(id, callback) {
    const query = `SELECT * FROM material_inventory WHERE id = ?`;
    db.query(query, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }
}

module.exports = MaterialInventory;
