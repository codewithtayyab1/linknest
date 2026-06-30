const express = require('express');
const router  = express.Router();
const { signup, login, me, updateProfile } = require('../controllers/authController');
const protect  = require('../middleware/auth');
const validate = require('../middleware/validate');
const { signupRules, loginRules } = require('../validators/auth');

router.post('/signup', signupRules, validate, signup);
router.post('/login',  loginRules,  validate, login);
router.get('/me',      protect, me);
router.patch('/profile', protect, updateProfile);

module.exports = router;
