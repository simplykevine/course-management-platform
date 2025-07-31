const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');
const { generateTestTokens } = require('../fixtures/testData');

describe('Course Allocation Integration Tests', () => {
  let managerToken, facilitatorToken, studentToken;
  let testModule, testClass, testCohort, testMode, testFacilitator;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test users and get tokens
    const tokens = generateTestTokens();
    managerToken = tokens.managerToken;
    facilitatorToken = tokens.facilitatorToken;
    studentToken = tokens.studentToken;

    // Create test data
    const { Module, Class, Cohort, Mode, User, Facilitator } = require('../../src/models');
    
    testModule = await Module.create({
      code: 'CS101',
      name: 'Intro to CS',
      credits: 3,
      level: '100'
    });

    testClass = await Class.create({
      name: '2025S',
      year: 2025,
      section: 'S'
    });

    testCohort = await Cohort.create({
      name: 'CS 2025',
      code: 'CS2025',
      startDate: '2025-01-01',
      endDate: '2028-12-31',
      program: 'Computer Science'
    });

    testMode = await Mode.create({
      name: 'Online',
      description: 'Online delivery'
    });

    const facilitatorUser = await User.create({
      email: 'facilitator@test.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Facilitator',
      role: 'facilitator'
    });

    testFacilitator = await Facilitator.create({
      userId: facilitatorUser.id,
      employeeId: 'FAC001',
      department: 'Computer Science'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Course Offering Management', () => {
    it('should allow manager to create course offering', async () => {
      const offeringData = {
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        facilitatorId: testFacilitator.id,
        modeId: testMode.id,
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-09-01',
        endDate: '2025-12-15',
        maxStudents: 30
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(offeringData)
        .expect(201);

      expect(response.body.message).toBe('Course offering created successfully');
      expect(response.body.courseOffering).toBeDefined();
    });

    it('should prevent duplicate course offerings', async () => {
      const offeringData = {
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        modeId: testMode.id,
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-09-01',
        endDate: '2025-12-15'
      };

      // Create first offering
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(offeringData)
        .expect(201);

      // Attempt to create duplicate
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(offeringData)
        .expect(409);
    });

    it('should deny student access to create course offering', async () => {
      const offeringData = {
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        modeId: testMode.id,
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-09-01',
        endDate: '2025-12-15'
      };

      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(offeringData)
        .expect(403);
    });

    it('should allow filtering course offerings', async () => {
      const response = await request(app)
        .get('/api/courses?trimester=1&status=planned')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.courseOfferings).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('Module Management', () => {
    it('should allow manager to create module', async () => {
      const moduleData = {
        code: 'CS201',
        name: 'Data Structures',
        description: 'Advanced data structures',
        credits: 4,
        level: '200'
      };

      const response = await request(app)
        .post('/api/courses/modules')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(moduleData)
        .expect(201);

      expect(response.body.message).toBe('Module created successfully');
      expect(response.body.module.code).toBe('CS201');
    });

    it('should reject invalid module code format', async () => {
      const moduleData = {
        code: 'INVALID',
        name: 'Invalid Module',
        credits: 3,
        level: '100'
      };

      await request(app)
        .post('/api/courses/modules')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(moduleData)
        .expect(400);
    });

    it('should allow all authenticated users to view modules', async () => {
      await request(app)
        .get('/api/courses/modules')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);
    });
  });
});