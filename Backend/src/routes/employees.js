const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken } = require('../middlewares/auth');

// All routes require authentication
router.use(verifyToken);

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.get('/project/:projectId', employeeController.getEmployeesByProject);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
