const Project = require('../models/Project');

class ProjectController {
    // Get all projects
    static getAllProjects(req, res) {
        Project.getAll(req.user, (err, results) => {
            if (err) {
                console.error('Error fetching all projects:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    }

    // Get project by ID
    static getProjectById(req, res) {
        const { id } = req.params;

        Project.getById(id, req.user, (err, results) => {
            if (err) {
                console.error(`Error fetching project with ID ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
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

        Project.getByClientId(clientId, req.user, (err, results) => {
            if (err) {
                console.error(`Error fetching projects for client ID ${clientId}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        });
    }

    // Create new project
    static createProject(req, res) {
        const projectData = req.body;

        // Automatically set created_by from authenticated user
        projectData.created_by = req.user.id;

        // Validate required fields
        if (!projectData.project_name || !projectData.client_id || !projectData.start_date) {
            return res.status(400).json({
                error: 'Missing required fields: project_name, client_id, and start_date are required'
            });
        }

        Project.create(projectData, (err, result) => {
            if (err) {
                console.error('Error creating project:', err);
                return res.status(500).json({ error: 'Internal server error' });
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
                console.error(`Error updating project with ID ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
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
                console.error(`Error deleting project with ID ${id}:`, err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json({ message: 'Project deleted successfully' });
        });
    }

    // Get project statistics
    static getProjectStats(req, res) {
        Project.getStats(req.user, (err, results) => {
            if (err) {
                console.error('Error fetching project statistics:', err);
                return res.status(500).json({ error: 'Internal server error' });
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
