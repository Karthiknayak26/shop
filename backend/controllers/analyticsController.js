const emailService = require('../services/emailService');

exports.getEmailStats = async (req, res, next) => {
  try {
    const stats = await emailService.getDeliveryStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};