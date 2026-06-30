const express = require('express');
const router = express.Router();
const { getPublicProfile, trackClick } = require('../controllers/publicController');

router.get('/:username', getPublicProfile);
router.post('/:username/click/:linkId', trackClick);

module.exports = router;
