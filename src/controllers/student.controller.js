const User = require('../models/user.model');

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private (Student, Teacher)
 */
const getAllStudents = async (req, res, next) => {
  try {
    const { department, batch, semester, search } = req.query;

    const query = { role: 'Student' };

    if (department) {
      query.department = new RegExp(department, 'i');
    }
    if (batch) {
      query.batch = new RegExp(batch, 'i');
    }
    if (semester) {
      query.semester = Number(semester);
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { rollNumber: new RegExp(search, 'i') }
      ];
    }

    const students = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get student by ID
 * @route   GET /api/students/:id
 * @access  Private (Student, Teacher)
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({ _id: id, role: 'Student' });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a student's record (e.g. grades, semester, batch, details)
 * @route   PUT /api/students/:id
 * @access  Private (Teacher only)
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await User.findOne({ _id: id, role: 'Student' });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Editable fields for teacher updating a student
    const allowedFields = [
      'name',
      'department',
      'phone',
      'rollNumber',
      'semester',
      'batch',
      'cgpa',
      'guardianName'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully by teacher.',
      data: updatedStudent
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudent
};
