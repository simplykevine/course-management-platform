const { User, Manager, Facilitator, Student } = require('../models');
const { sequelize } = require('../models');
const logger = require('../utils/logger');

class AuthService {
  async createUser(userData) {
    const transaction = await sequelize.transaction();
    
    try {
      // Create user
      const user = await User.create(userData, { transaction });
      
      // Create role-specific record
      switch (userData.role) {
        case 'manager':
          await Manager.create({
            userId: user.id,
            employeeId: userData.employeeId,
            department: userData.department
          }, { transaction });
          break;
          
        case 'facilitator':
          await Facilitator.create({
            userId: user.id,
            employeeId: userData.employeeId,
            department: userData.department,
            specialization: userData.specialization
          }, { transaction });
          break;
          
        case 'student':
          await Student.create({
            userId: user.id,
            studentId: userData.studentId,
            cohortId: userData.cohortId,
            enrollmentDate: new Date()
          }, { transaction });
          break;
      }
      
      await transaction.commit();
      
      // Reload user with associations
      const createdUser = await this.getUserProfile(user.id);
      return createdUser;
    } catch (error) {
      await transaction.rollback();
      logger.error('Create user error:', error);
      throw error;
    }
  }
  
  async authenticateUser(email, password) {
    try {
      const user = await User.findOne({
        where: { email, isActive: true }
      });
      
      if (!user) {
        return null;
      }
      
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return null;
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save({ silent: true });
      
      return user;
    } catch (error) {
      logger.error('Authenticate user error:', error);
      throw error;
    }
  }
  
  async getUserById(id) {
    try {
      const user = await User.findByPk(id);
      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }
  
  async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          { model: Manager, as: 'manager' },
          { model: Facilitator, as: 'facilitator' },
          { 
            model: Student, 
            as: 'student',
            include: ['cohort']
          }
        ]
      });
      
      return user;
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }
  
  async updateUserProfile(userId, updates) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Only allow updating certain fields
      const allowedFields = ['firstName', 'lastName'];
      const filteredUpdates = {};
      
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });
      
      await user.update(filteredUpdates);
      
      return this.getUserProfile(userId);
    } catch (error) {
      logger.error('Update user profile error:', error);
      throw error;
    }
  }
  
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const isPasswordValid = await user.validatePassword(currentPassword);
      if (!isPasswordValid) {
        return false;
      }
      
      user.password = newPassword;
      await user.save();
      
      return true;
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
  
  async resetPassword(email) {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Don't reveal if user exists
        return true;
      }
      
      // Generate reset token
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry
      
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();
      
      // TODO: Send reset email
      logger.info(`Password reset token generated for ${email}`);
      
      return true;
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();