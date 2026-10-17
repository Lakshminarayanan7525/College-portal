const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      required: [true, 'Please specify user role (Student or Teacher)'],
      enum: {
        values: ['Student', 'Teacher'],
        message: '{VALUE} is not a valid role. Allowed roles are Student or Teacher'
      }
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },

    // --- Student-specific attributes ---
    rollNumber: {
      type: String,
      trim: true,
      default: ''
    },
    semester: {
      type: Number,
      default: null
    },
    batch: {
      type: String,
      trim: true,
      default: ''
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    guardianName: {
      type: String,
      trim: true,
      default: ''
    },

    // --- Teacher-specific attributes ---
    employeeId: {
      type: String,
      trim: true,
      default: ''
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    qualification: {
      type: String,
      trim: true,
      default: ''
    },
    subjectsTaught: {
      type: [String],
      default: []
    },
    officeRoom: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET || 'default_jwt_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// Sanitize user object output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
