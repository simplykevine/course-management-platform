const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User } = require('../../src/models');

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new manager', async () => {
      const userData = {
        email: 'manager@test.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Manager',
        role: 'manager',
        employeeId: 'MGR001',
        department: 'Computer Science'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Registration successful');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('manager');
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBeDefined();
      expect(response.body.tokens.refreshToken).toBeDefined();
    });

    it('should register a new facilitator', async () => {
      const userData = {
        email: 'facilitator@test.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Facilitator',
        role: 'facilitator',
        employeeId: 'FAC001',
        department: 'Computer Science',
        specialization: 'Web Development'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('facilitator');
      expect(response.body.user.facilitator).toBeDefined();
    });

    it('should register a new student', async () => {
      // First create a cohort for the student
      const { Cohort } = require('../../src/models');
      const cohort = await Cohort.create({
        name: 'Test Cohort',
        code: 'TC2025',
        startDate: '2025-01-01',
        endDate: '2028-12-31',
        program: 'Computer Science'
      });

      const userData = {
        email: 'student@test.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Student',
        role: 'student',
        studentId: '202500001',
        cohortId: cohort.id
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('student');
      expect(response.body.user.student).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);
    });

    it('should reject invalid password', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const userData = {
        email: 'test@test.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'Password123!'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.tokens).toBeDefined();
      expect(response.body.user.email).toBe('test@test.com');
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123!'
        })
        .expect(401);
    });
  });
});