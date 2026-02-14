const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/permission');
const usersController = require('../controllers/usersController');

// User routes - all require authentication
router.get('/', verifyToken, checkPermission('users', 'view'), usersController.getAllUsers);
router.get('/:id', verifyToken, usersController.getUserById); // Controller handles self-access
router.get('/:id/check-deletion', verifyToken, checkPermission('users', 'delete'), usersController.checkUserDeletion);
router.post('/', verifyToken, checkPermission('users', 'create'), usersController.createUser);
router.put('/:id', verifyToken, usersController.updateUser); // Controller handles self-access
router.delete('/:id', verifyToken, checkPermission('users', 'delete'), usersController.deleteUser);

module.exports = router;
