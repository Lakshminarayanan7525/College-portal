const User = require('../models/user.model');

/**
 * @desc    Get all teachers
 * @route   GET /api/teachers
 * @access  Private (Teacher only)
 */
const getAllTeachers = async (req, res, next) => {
  try {
    const { department, designation, search } = req.query;

    const query = { role: 'Teacher' };

    if (department) {
      query.department = new RegExp(department, 'i');
    }
    if (designation) {
      query.designation = new RegExp(designation, 'i');
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { employeeId: new RegExp(search, 'i') }
      ];
    }

    const teachers = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get teacher by ID
 * @route   GET /api/teachers/:id
 * @access  Private (Teacher only)
 */
const getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teacher = await User.findOne({ _id: id, role: 'Teacher' });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById
};
