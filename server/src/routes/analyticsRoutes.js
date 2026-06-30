const express = require('express');
const router  = express.Router();
const protect = require('../middleware/auth');
const { getSummary, getBreakdown } = require('../controllers/analyticsController');

router.use(protect);

router.get('/summary',   getSummary);
router.get('/breakdown', getBreakdown);

module.exports = router;
