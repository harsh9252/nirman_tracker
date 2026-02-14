const db = require('../config/database');

class Lead {
  // Get all leads
  static getAll(callback) {
    const sql = 'SELECT * FROM leads ORDER BY id DESC';
    db.query(sql, callback);
  }

  // Get lead by ID
  static getById(id, callback) {
    const sql = 'SELECT * FROM leads WHERE id = ?';
    db.query(sql, [id], callback);
  }

  // Create new lead
  static create(leadData, callback) {
    const {
      contact_name,
      date,
      phone,
      email,
      company_name,
      address,
      lead_type,
      source,
      lead_status,
      last_contacted_date,
      lead_assignee,
      description
    } = leadData;

    const sql = `INSERT INTO leads (contact_name, date, phone, email, company_name, address, lead_type, source, lead_status, last_contacted_date, lead_assignee, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      contact_name,
      date,
      phone,
      email || null,
      company_name || null,
      address || null,
      lead_type || null,
      source || null,
      lead_status || null,
      last_contacted_date || null,
      lead_assignee || null,
      description || null
    ];

    db.query(sql, values, callback);
  }

  // Update lead
  static update(id, leadData, callback) {
    const {
      contact_name,
      date,
      phone,
      email,
      company_name,
      address,
      lead_type,
      source,
      lead_status,
      last_contacted_date,
      lead_assignee,
      description
    } = leadData;

    const sql = `UPDATE leads SET contact_name=?, date=?, phone=?, email=?, company_name=?, address=?, lead_type=?, source=?, lead_status=?, last_contacted_date=?, lead_assignee=?, description=? WHERE id=?`;
    const values = [
      contact_name,
      date,
      phone,
      email || null,
      company_name || null,
      address || null,
      lead_type || null,
      source || null,
      lead_status || null,
      last_contacted_date || null,
      lead_assignee || null,
      description || null,
      id
    ];

    db.query(sql, values, callback);
  }

  // Delete lead
  static delete(id, callback) {
    const sql = 'DELETE FROM leads WHERE id = ?';
    db.query(sql, [id], callback);
  }

  // Mark lead as converted and link to client
  static markAsConverted(leadId, clientId, callback) {
    const sql = `UPDATE leads SET 
      is_converted = TRUE, 
      lead_status = 'Close - Convert',
      conversion_date = NOW(), 
      client_id = ? 
      WHERE id = ? AND is_converted = FALSE AND is_lost = FALSE`;
    db.query(sql, [clientId, leadId], callback);
  }

  // Mark lead as lost
  static markAsLost(leadId, lostReason, callback) {
    const sql = `UPDATE leads SET 
      is_lost = TRUE, 
      lost_date = NOW(), 
      lost_reason = ? 
      WHERE id = ? AND is_converted = FALSE AND is_lost = FALSE`;
    db.query(sql, [lostReason || null, leadId], callback);
  }

  // Check if lead can be edited (not converted and not lost)
  static canEdit(leadId, callback) {
    const sql = 'SELECT is_converted, is_lost FROM leads WHERE id = ?';
    db.query(sql, [leadId], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Lead not found'));

      const lead = results[0];
      const editable = !lead.is_converted && !lead.is_lost;
      callback(null, editable);
    });
  }

  // Check if lead can be deleted (not converted and not lost)
  static canDelete(leadId, callback) {
    const sql = 'SELECT is_converted, is_lost FROM leads WHERE id = ?';
    db.query(sql, [leadId], (err, results) => {
      if (err) return callback(err);
      if (results.length === 0) return callback(new Error('Lead not found'));

      const lead = results[0];
      const deletable = !lead.is_converted && !lead.is_lost;
      callback(null, deletable, lead);
    });
  }
}

module.exports = Lead;
