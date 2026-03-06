const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');
const employeeController = require('../controllers/employeeController');

// All routes require authentication
router.use(verifyToken);

router.get('/', checkPermission('employees', 'view'), employeeController.getAllEmployees);
router.get('/salary-types', verifyToken, employeeController.getSalaryTypes);
router.get('/project/:projectId', checkPermission('employees', 'view'), employeeController.getEmployeesByProject);
router.get('/:id', checkPermission('employees', 'view'), employeeController.getEmployeeById);
router.post('/', checkPermission('employees', 'create'), employeeController.createEmployee);
router.put('/:id', checkPermission('employees', 'edit'), employeeController.updateEmployee);
router.delete('/:id', checkPermission('employees', 'delete'), employeeController.deleteEmployee);

module.exports = router;
