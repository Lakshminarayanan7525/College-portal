const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const permissionMiddleware = require('../middlewares/permission.middleware');
const { getProfile, updateProfile } = require('../controllers/user.controller');

// All profile routes require authentication
router.use(authMiddleware);

// Profile can be accessed and updated by both Students and Teachers
router.get(
  '/profile',
  permissionMiddleware('Student', 'Teacher'),
  getProfile
);

router.put(
  '/profile',
  permissionMiddleware('Student', 'Teacher'),
  updateProfile
);

module.exports = router;
