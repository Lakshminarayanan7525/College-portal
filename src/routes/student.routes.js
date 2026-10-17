const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const permissionMiddleware = require('../middlewares/permission.middleware');
const {
  getAllStudents,
  getStudentById,
  updateStudent
} = require('../controllers/student.controller');

// Require authentication for all student routes
router.use(authMiddleware);

// Get all students - Accessible by Student and Teacher
router.get(
  '/',
  permissionMiddleware('Student', 'Teacher'),
  getAllStudents
);

// Get student by ID - Accessible by Student and Teacher
router.get(
  '/:id',
  permissionMiddleware('Student', 'Teacher'),
  getStudentById
);

// Update student record - Accessible ONLY by Teacher
router.put(
  '/:id',
  permissionMiddleware('Teacher'),
  updateStudent
);

module.exports = router;
