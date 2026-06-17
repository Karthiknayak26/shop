const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Create feedback (public)
router.post('/', feedbackController.createFeedback);
// Get all feedbacks (admin only)
router.get('/', authMiddleware, adminMiddleware, feedbackController.getFeedbacks);
// Delete feedback by id (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, feedbackController.deleteFeedback);

module.exports = router; 