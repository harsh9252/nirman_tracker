const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { verifyToken } = require('../middlewares/auth');

// User routes - all require authentication
router.get('/', verifyToken, usersController.getAllUsers);
router.get('/:id', verifyToken, usersController.getUserById);
router.get('/:id/check-deletion', verifyToken, usersController.checkUserDeletion);
router.post('/', verifyToken, usersController.createUser);
router.put('/:id', verifyToken, usersController.updateUser);
router.delete('/:id', verifyToken, usersController.deleteUser);

module.exports = router;
