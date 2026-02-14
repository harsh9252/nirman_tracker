const db = require('../config/database');

class Client {
    // Get all clients
    static getAll(callback) {
        const sql = 'SELECT * FROM clients ORDER BY conversion_date DESC';
        db.query(sql, callback);
    }

    // Get client by ID
    static getById(id, callback) {
        const sql = 'SELECT * FROM clients WHERE id = ?';
        db.query(sql, [id], callback);
    }

    // Get client by lead ID
    static getByLeadId(leadId, callback) {
        const sql = 'SELECT * FROM clients WHERE lead_id = ?';
        db.query(sql, [leadId], callback);
    }

    // Create new client from lead data
    static createFromLead(leadData, leadId, callback) {
        const {
            contact_name,
            phone,
            email,
            company_name,
            address,
            lead_type,
            source,
            description
        } = leadData;

        const sql = `INSERT INTO clients 
      (client_name, phone, email, company_name, address, lead_id, lead_type, source, description, conversion_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        const values = [
            contact_name,
            phone,
            email || null,
            company_name || null,
            address || null,
            leadId,
            lead_type || null,
            source || null,
            description || null
        ];

        db.query(sql, values, callback);
    }

    // Create new client manually
    static create(clientData, callback) {
        const {
            client_name,
            phone,
            email,
            company_name,
            address,
            lead_type,
            source,
            description
        } = clientData;

        const sql = `INSERT INTO clients 
      (client_name, phone, email, company_name, address, lead_id, lead_type, source, description, conversion_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        const values = [
            client_name,
            phone,
            email || null,
            company_name || null,
            address || null,
            null, // lead_id is null for manual creation
            lead_type || null,
            source || null,
            description || null
        ];

        db.query(sql, values, callback);
    }

    // Update client
    static update(id, clientData, callback) {
        const {
            client_name,
            phone,
            email,
            company_name,
            address,
            lead_type,
            source,
            description
        } = clientData;

        const sql = `UPDATE clients SET 
      client_name=?, phone=?, email=?, company_name=?, address=?, 
      lead_type=?, source=?, description=? 
      WHERE id=?`;

        const values = [
            client_name,
            phone,
            email || null,
            company_name || null,
            address || null,
            lead_type || null,
            source || null,
            description || null,
            id
        ];

        db.query(sql, values, callback);
    }

    // Delete client
    static delete(id, callback) {
        const sql = 'DELETE FROM clients WHERE id = ?';
        db.query(sql, [id], callback);
    }
}

module.exports = Client;
