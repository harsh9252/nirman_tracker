const db = require('../config/database');

class Project {
    // Get all projects with client information
    static getAll(callback) {
        const sql = `
            SELECT 
                p.*,
                c.client_name,
                c.company_name,
                c.address as client_address,
                CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN users u ON p.created_by = u.id
            ORDER BY p.created_at DESC
        `;
        db.query(sql, callback);
    }

    // Get project by ID
    static getById(id, callback) {
        const sql = `
            SELECT 
                p.*,
                c.client_name,
                c.company_name,
                c.address as client_address,
                c.phone as client_phone,
                c.email as client_email,
                CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = ?
        `;
        db.query(sql, [id], callback);
    }

    // Get all projects for a specific client
    static getByClientId(clientId, callback) {
        const sql = `
            SELECT 
                p.*,
                c.client_name,
                c.company_name,
                c.address as client_address,
                CONCAT(u.first_name, ' ', u.last_name) as created_by_name
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.client_id = ?
            ORDER BY p.created_at DESC
        `;
        db.query(sql, [clientId], callback);
    }

    // Create new project
    static create(projectData, callback) {
        const {
            project_name,
            client_id,
            project_type,
            status,
            start_date,
            expected_completion_date,
            actual_completion_date,
            estimated_budget,
            actual_cost,
            description,
            scope_of_work,
            created_by
        } = projectData;

        const sql = `
            INSERT INTO projects 
            (project_name, client_id, project_type, status, start_date, 
             expected_completion_date, actual_completion_date, estimated_budget, 
             actual_cost, description, scope_of_work, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            project_name,
            client_id,
            project_type || 'Other',
            status || 'Planning',
            start_date,
            expected_completion_date || null,
            actual_completion_date || null,
            estimated_budget || null,
            actual_cost || null,
            description || null,
            scope_of_work || null,
            created_by || null
        ];

        db.query(sql, values, callback);
    }

    // Update project
    static update(id, projectData, callback) {
        const {
            project_name,
            client_id,
            project_type,
            status,
            start_date,
            expected_completion_date,
            actual_completion_date,
            estimated_budget,
            actual_cost,
            description,
            scope_of_work
        } = projectData;

        const sql = `
            UPDATE projects SET 
                project_name = ?,
                client_id = ?,
                project_type = ?,
                status = ?,
                start_date = ?,
                expected_completion_date = ?,
                actual_completion_date = ?,
                estimated_budget = ?,
                actual_cost = ?,
                description = ?,
                scope_of_work = ?
            WHERE id = ?
        `;

        const values = [
            project_name,
            client_id,
            project_type || 'Other',
            status || 'Planning',
            start_date,
            expected_completion_date || null,
            actual_completion_date || null,
            estimated_budget || null,
            actual_cost || null,
            description || null,
            scope_of_work || null,
            id
        ];

        db.query(sql, values, callback);
    }

    // Delete project
    static delete(id, callback) {
        const sql = 'DELETE FROM projects WHERE id = ?';
        db.query(sql, [id], callback);
    }

    // Get project statistics
    static getStats(callback) {
        const sql = `
            SELECT 
                COUNT(*) as total_projects,
                SUM(CASE WHEN status = 'Planning' THEN 1 ELSE 0 END) as planning_count,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status = 'On Hold' THEN 1 ELSE 0 END) as on_hold_count,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_count,
                SUM(estimated_budget) as total_estimated_budget,
                SUM(actual_cost) as total_actual_cost
            FROM projects
        `;
        db.query(sql, callback);
    }
}

module.exports = Project;
