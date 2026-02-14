const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

// Get all projects
router.get('/', verifyToken, checkPermission('projects', 'view'), ProjectController.getAllProjects);

// Get project statistics
router.get('/stats', verifyToken, ProjectController.getProjectStats);

// Get project by ID
router.get('/:id', verifyToken, checkPermission('projects', 'view'), ProjectController.getProjectById);

// Get projects by client ID
router.get('/client/:clientId', verifyToken, checkPermission('projects', 'view'), ProjectController.getProjectsByClient);

// Create new project
router.post('/', verifyToken, checkPermission('projects', 'create'), ProjectController.createProject);

// Update project
router.put('/:id', verifyToken, checkPermission('projects', 'edit'), ProjectController.updateProject);

// Delete project
router.delete('/:id', verifyToken, checkPermission('projects', 'delete'), ProjectController.deleteProject);

module.exports = router;
