const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/commentController');
const { verifyToken } = require('../middlewares/auth');

// All comment routes require authentication
router.use(verifyToken);

// Get all comments for a specific task
router.get('/task/:taskId', CommentController.getCommentsByTask);

// Create new comment
router.post('/', CommentController.createComment);

// Update comment
router.put('/:id', CommentController.updateComment);

// Delete comment
router.delete('/:id', CommentController.deleteComment);

// Get replies for a specific comment
router.get('/:commentId/replies', CommentController.getCommentReplies);

module.exports = router;
