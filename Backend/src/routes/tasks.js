const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { verifyToken } = require('../middlewares/auth');

// Task routes - all require authentication
router.get('/', verifyToken, TaskController.getAllTasks);
router.get('/next-number', verifyToken, TaskController.getNextTaskNumber);
router.get('/:id', verifyToken, TaskController.getTaskById);
router.post('/', verifyToken, TaskController.createTask);
router.put('/:id', verifyToken, TaskController.updateTask);
router.delete('/:id', verifyToken, TaskController.deleteTask);

module.exports = router;
