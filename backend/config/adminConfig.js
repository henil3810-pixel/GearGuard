const bcrypt = require('bcryptjs');

// Admin configuration
// Admin email is fixed and cannot be changed
const ADMIN_EMAIL = 'admin@gmail.com';

// Hashed version of Admin@123 password
// This hash is generated using bcrypt with salt rounds of 10
const ADMIN_PASSWORD_HASH = '$2b$10$h4/GRRgO4Z.oJ.axMiEhp.1ZPko1.00CH3nNeKEz792qMF/1ggUFS';

// Admin ID used in JWT tokens
const ADMIN_ID = 'admin';

/**
 * Validate admin password
 * @param {string} password - Plain text password to validate
 * @returns {Promise<boolean>} - True if password matches
 */
const validateAdminPassword = async (password) => {
  return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
};

module.exports = {
  ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH,
  ADMIN_ID,
  validateAdminPassword,
};

