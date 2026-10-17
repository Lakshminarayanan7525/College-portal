const User = require('../models/user.model');

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/users/profile
 * @access  Private (Student, Teacher)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update currently logged-in user profile
 * @route   PUT /api/users/profile
 * @access  Private (Student, Teacher)
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    // Prohibit changing role or email directly through profile update
    if (req.body.role && req.body.role !== user.role) {
      return res.status(400).json({
        success: false,
        message: 'Changing user role is not permitted.'
      });
    }

    if (req.body.email && req.body.email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: req.body.email.toLowerCase()
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'The requested email is already in use.'
        });
      }
      user.email = req.body.email.toLowerCase();
    }

    // Common profile updates
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.department !== undefined) user.department = req.body.department;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    // Role-specific fields update
    if (user.role === 'Student') {
      if (req.body.rollNumber !== undefined) user.rollNumber = req.body.rollNumber;
      if (req.body.batch !== undefined) user.batch = req.body.batch;
      if (req.body.guardianName !== undefined)
        user.guardianName = req.body.guardianName;
    } else if (user.role === 'Teacher') {
      if (req.body.employeeId !== undefined) user.employeeId = req.body.employeeId;
      if (req.body.designation !== undefined)
        user.designation = req.body.designation;
      if (req.body.qualification !== undefined)
        user.qualification = req.body.qualification;
      if (req.body.subjectsTaught !== undefined) {
        user.subjectsTaught = Array.isArray(req.body.subjectsTaught)
          ? req.body.subjectsTaught
          : [req.body.subjectsTaught];
      }
      if (req.body.officeRoom !== undefined)
        user.officeRoom = req.body.officeRoom;
    }

    // Handle password change if provided
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.'
        });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
