const User = require('../models/user.model');

/**
 * @desc    Register a new user (Student or Teacher)
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      department,
      avatar,
      // Student attributes
      rollNumber,
      semester,
      batch,
      cgpa,
      guardianName,
      // Teacher attributes
      employeeId,
      designation,
      qualification,
      subjectsTaught,
      officeRoom
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role (Student or Teacher).'
      });
    }

    // Normalize role formatting (e.g., student -> Student, teacher -> Teacher)
    const formattedRole =
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    if (!['Student', 'Teacher'].includes(formattedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Role must be either 'Student' or 'Teacher'."
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Prepare user data based on role
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: formattedRole,
      phone,
      department,
      avatar
    };

    if (formattedRole === 'Student') {
      if (rollNumber) userData.rollNumber = rollNumber;
      if (semester !== undefined) userData.semester = semester;
      if (batch) userData.batch = batch;
      if (cgpa !== undefined) userData.cgpa = cgpa;
      if (guardianName) userData.guardianName = guardianName;
    } else if (formattedRole === 'Teacher') {
      if (employeeId) userData.employeeId = employeeId;
      if (designation) userData.designation = designation;
      if (qualification) userData.qualification = qualification;
      if (subjectsTaught) {
        userData.subjectsTaught = Array.isArray(subjectsTaught)
          ? subjectsTaught
          : [subjectsTaught];
      }
      if (officeRoom) userData.officeRoom = officeRoom;
    }

    const user = await User.create(userData);
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: `${formattedRole} registered successfully!`,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user by email and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}! Logged in as ${user.role}.`,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login
};
