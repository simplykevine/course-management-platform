const { sequelize, User } = require('../../../src/models');
const bcrypt = require('bcrypt');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.role).toBe(userData.role);
      expect(user.isActive).toBe(true);
    });

    it('should hash the password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      const user = await User.create(userData);
      
      expect(user.password).not.toBe(userData.password);
      const isPasswordValid = await bcrypt.compare(userData.password, user.password);
      expect(isPasswordValid).toBe(true);
    });

    it('should throw error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      await User.create(userData);
      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce role enum values', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'invalid-role'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    it('should validate correct password', async () => {
      const password = 'password123';
      const user = await User.create({
        email: 'test@example.com',
        password,
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const isValid = await user.validatePassword(password);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const isValid = await user.validatePassword('wrongpassword');
      expect(isValid).toBe(false);
    });

    it('should return full name', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      expect(user.getFullName()).toBe('John Doe');
    });

    it('should exclude sensitive fields in toJSON', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const json = user.toJSON();
      
      expect(json.password).toBeUndefined();
      expect(json.resetPasswordToken).toBeUndefined();
      expect(json.resetPasswordExpires).toBeUndefined();
      expect(json.deletedAt).toBeUndefined();
      expect(json.email).toBe('test@example.com');
    });
  });

  describe('User Update', () => {
    it('should hash password on update', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      const oldPasswordHash = user.password;
      
      user.password = 'newpassword123';
      await user.save();

      expect(user.password).not.toBe(oldPasswordHash);
      expect(user.password).not.toBe('newpassword123');
      
      const isValid = await user.validatePassword('newpassword123');
      expect(isValid).toBe(true);
    });

    it('should update lastLogin field', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      expect(user.lastLogin).toBeNull();

      const loginTime = new Date();
      user.lastLogin = loginTime;
      await user.save();

      expect(user.lastLogin).toEqual(loginTime);
    });
  });

  describe('Soft Delete', () => {
    it('should soft delete user', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      });

      await user.destroy();

      const foundUser = await User.findByPk(user.id);
      expect(foundUser).toBeNull();

      const foundUserWithDeleted = await User.findByPk(user.id, { paranoid: false });
      expect(foundUserWithDeleted).toBeDefined();
      expect(foundUserWithDeleted.deletedAt).toBeDefined();
    });
  });
});