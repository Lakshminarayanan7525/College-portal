const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const studentRoutes = require('./student.routes');
const teacherRoutes = require('./teacher.routes');

// Documentation / Health info
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College Portal API is operational',
    version: '1.0.0',
    documentation: {
      auth: ['POST /api/auth/signup', 'POST /api/auth/login'],
      users: ['GET /api/users/profile', 'PUT /api/users/profile'],
      students: [
        'GET /api/students',
        'GET /api/students/:id',
        'PUT /api/students/:id (Teacher only)'
      ],
      teachers: [
        'GET /api/teachers (Teacher only)',
        'GET /api/teachers/:id (Teacher only)'
      ]
    }
  });
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Modular Route Mounts
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);

module.exports = router;
