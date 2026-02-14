const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

// Get all projects
router.get('/', ProjectController.getAllProjects);

// Get project statistics
router.get('/stats', ProjectController.getProjectStats);

// Get project by ID
router.get('/:id', ProjectController.getProjectById);

// Get projects by client ID
router.get('/client/:clientId', ProjectController.getProjectsByClient);

// Create new project
router.post('/', ProjectController.createProject);

// Update project
router.put('/:id', ProjectController.updateProject);

// Delete project
router.delete('/:id', ProjectController.deleteProject);

module.exports = router;
