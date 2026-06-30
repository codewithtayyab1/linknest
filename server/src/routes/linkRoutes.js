const express = require('express');
const router  = express.Router();
const protect  = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createLinkRules } = require('../validators/links');
const {
  getMyLinks,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} = require('../controllers/linkController');

router.use(protect);

router.get('/',           getMyLinks);
router.post('/',          createLinkRules, validate, createLink);
router.put('/reorder',    reorderLinks);
router.put('/:id',        updateLink);
router.delete('/:id',     deleteLink);

module.exports = router;
