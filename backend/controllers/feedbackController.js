const Feedback = require('../models/Feedback');

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, orderId, message } = req.body;
    const feedback = new Feedback({ name, email, orderId, message });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Get all feedbacks
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
};

// Delete feedback by ID
exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
}; 