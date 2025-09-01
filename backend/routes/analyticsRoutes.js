const express = require('express');
const { getEmailStats } = require('../controllers/analyticsController');
const router = express.Router();

router.get('/email-stats', getEmailStats);

module.exports = router;