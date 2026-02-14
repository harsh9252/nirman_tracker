const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');

// Task routes - all require authentication
router.get('/', verifyToken, checkPermission('tasks', 'view'), TaskController.getAllTasks);
router.get('/next-number', verifyToken, checkPermission('tasks', 'view'), TaskController.getNextTaskNumber);
router.get('/:id', verifyToken, checkPermission('tasks', 'view'), TaskController.getTaskById);
router.post('/', verifyToken, checkPermission('tasks', 'create'), TaskController.createTask);
router.put('/:id', verifyToken, checkPermission('tasks', 'edit'), TaskController.updateTask);
router.delete('/:id', verifyToken, checkPermission('tasks', 'delete'), TaskController.deleteTask);

module.exports = router;
