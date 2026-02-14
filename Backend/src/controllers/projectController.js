const Project = require('../models/Project');

class ProjectController {
    // Get all projects
    static getAllProjects(req, res) {
        Project.getAll((err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    }

    // Get project by ID
    static getProjectById(req, res) {
        const { id } = req.params;

        Project.getById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json(results[0]);
        });
    }

    // Get projects by client ID
    static getProjectsByClient(req, res) {
        const { clientId } = req.params;

        Project.getByClientId(clientId, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(results);
        });
    }

    // Create new project
    static createProject(req, res) {
        const projectData = req.body;

        // Validate required fields
        if (!projectData.project_name || !projectData.client_id || !projectData.start_date) {
            return res.status(400).json({
                error: 'Missing required fields: project_name, client_id, and start_date are required'
            });
        }

        Project.create(projectData, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                message: 'Project created successfully',
                projectId: result.insertId
            });
        });
    }

    // Update project
    static updateProject(req, res) {
        const { id } = req.params;
        const projectData = req.body;

        Project.update(id, projectData, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json({ message: 'Project updated successfully' });
        });
    }

    // Delete project
    static deleteProject(req, res) {
        const { id } = req.params;

        Project.delete(id, (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json({ message: 'Project deleted successfully' });
        });
    }

    // Get project statistics
    static getProjectStats(req, res) {
        Project.getStats((err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.json({
                    total_projects: 0,
                    planning_count: 0,
                    in_progress_count: 0,
                    on_hold_count: 0,
                    completed_count: 0,
                    cancelled_count: 0,
                    total_estimated_budget: 0,
                    total_actual_cost: 0
                });
            }

            res.json(results[0]);
        });
    }
}

module.exports = ProjectController;
