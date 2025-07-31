const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
  
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const userData = req.body;
    const user = await authService.createUser(userData);
    
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    logger.info(`New user registered: ${user.email}`);
    
    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create user account'
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const user = await authService.authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    
    logger.info(`User logged in: ${user.email}`);
    
    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to process login request'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await authService.getUserById(decoded.id);
    
    if (!user) {
      throw new Error('User not found');
    }

    const tokens = generateTokens(user.id);
    
    res.json({
      message: 'Token refreshed successfully',
      tokens
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The refresh token is invalid or expired'
      });
    }
    
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Unable to refresh access token'
    });
  }
};

const logout = async (req, res) => {
  try {
    // In a production environment, you might want to:
    // 1. Add the token to a blacklist in Redis
    // 2. Clear any server-side sessions
    // 3. Log the logout event
    
    logger.info(`User logged out: ${req.user.email}`);
    
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to process logout request'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    
    res.json({
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve profile',
      message: 'Unable to fetch user profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const updates = req.body;
    const user = await authService.updateUserProfile(req.user.id, updates);
    
    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: 'Update failed',
      message: 'Unable to update profile'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const success = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );
    
    if (!success) {
      return res.status(401).json({
        error: 'Password change failed',
        message: 'Current password is incorrect'
      });
    }
    
    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Unable to change password'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
};