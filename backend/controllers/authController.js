const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ADMIN_EMAIL, ADMIN_ID, validateAdminPassword } = require('../config/adminConfig');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ userId: id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  // Block admin email from signing up
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ message: 'Admin account cannot be created through signup' });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  // Force role to be 'user' (default role)
  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if this is the admin email
  if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    // Validate admin password
    const isAdminPasswordValid = await validateAdminPassword(password);
    
    if (isAdminPasswordValid) {
      // Return admin user object with token
      return res.json({
        _id: ADMIN_ID,
        name: 'Admin',
        email: ADMIN_EMAIL,
        role: 'admin',
        token: generateToken(ADMIN_ID, 'admin'),
      });
    } else {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
  }

  // For regular users, authenticate from database
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
