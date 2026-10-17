const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const permissionMiddleware = require('../middlewares/permission.middleware');
const {
  getAllTeachers,
  getTeacherById
} = require('../controllers/teacher.controller');

// Require authentication for all teacher routes
router.use(authMiddleware);

// Get all teachers - Accessible ONLY by Teacher
router.get(
  '/',
  permissionMiddleware('Teacher'),
  getAllTeachers
);

// Get teacher by ID - Accessible ONLY by Teacher
router.get(
  '/:id',
  permissionMiddleware('Teacher'),
  getTeacherById
);

module.exports = router;
