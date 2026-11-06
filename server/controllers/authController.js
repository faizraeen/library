const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BorrowRecord = require('../models/BorrowRecord');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'librachain_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, studentId, role, walletAddress } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A user with this Student ID already exists',
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Auto-generate student ID if not provided and role is student
    let assignedStudentId = studentId;
    if (!assignedStudentId && role !== 'admin') {
      const count = await User.countDocuments({ role: 'student' });
      assignedStudentId = `STU-2026-${String(count + 1).padStart(3, '0')}`;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      studentId: assignedStudentId,
      role: role === 'admin' ? 'admin' : 'student',
      walletAddress: walletAddress || '',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Get current logged in user & borrowing stats
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');

    // Aggregate user borrowing stats
    const activeBorrows = await BorrowRecord.countDocuments({
      user: user._id,
      status: { $in: ['borrowed', 'overdue'] },
    });

    const now = new Date();
    const overdueBorrows = await BorrowRecord.countDocuments({
      user: user._id,
      status: 'borrowed',
      dueDate: { $lt: now },
    });

    const returnedCount = await BorrowRecord.countDocuments({
      user: user._id,
      status: 'returned',
    });

    const totalLoans = await BorrowRecord.countDocuments({
      user: user._id,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
      },
      stats: {
        activeBorrows,
        overdueBorrows,
        returnedCount,
        totalLoans,
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile',
    });
  }
};

// @desc    Update user profile (e.g. walletAddress, name)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, walletAddress, studentId } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (walletAddress !== undefined) updates.walletAddress = walletAddress.trim();
    if (studentId && req.user.role === 'admin') updates.studentId = studentId;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        studentId: updatedUser.studentId,
        role: updatedUser.role,
        walletAddress: updatedUser.walletAddress,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error updating profile',
    });
  }
};
