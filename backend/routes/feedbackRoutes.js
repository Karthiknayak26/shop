const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Create feedback
router.post('/', feedbackController.createFeedback);
// Get all feedbacks
router.get('/', feedbackController.getFeedbacks);
// Delete feedback by id
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router; 