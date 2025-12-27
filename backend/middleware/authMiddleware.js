const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ADMIN_ID, ADMIN_EMAIL } = require('../config/adminConfig');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if this is an admin user
      if (decoded.userId === ADMIN_ID && decoded.role === 'admin') {
        // Create virtual admin user object (not from database)
        req.user = {
          _id: ADMIN_ID,
          id: ADMIN_ID,
          name: 'Admin',
          email: ADMIN_EMAIL,
          role: 'admin',
        };
        return next();
      }

      // For regular users, get user from database
      // Handle both userId and id for backward compatibility
      const userId = decoded.userId || decoded.id;
      req.user = await User.findById(userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  // Strict check: Only admin@gmail.com with admin role can access admin routes
  if (req.user && req.user.email === ADMIN_EMAIL && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

module.exports = { protect, admin };
