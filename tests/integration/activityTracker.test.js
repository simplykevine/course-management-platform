const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');
const { generateTestTokens } = require('../fixtures/testData');

describe('Activity Tracker Integration Tests', () => {
  let managerToken, facilitatorToken;
  let testCourseOffering, testFacilitator;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    const tokens = generateTestTokens();
    managerToken = tokens.managerToken;
    facilitatorToken = tokens.facilitatorToken;

    // Set up test data
    const { 
      Module, Class, Cohort, Mode, CourseOffering, 
      User, Facilitator 
    } = require('../../src/models');
    
    const testModule = await Module.create({
      code: 'CS101',
      name: 'Test Module',
      credits: 3,
      level: '100'
    });

    const testClass = await Class.create({
      name: '2025S',
      year: 2025,
      section: 'S'
    });

    const testCohort = await Cohort.create({
      name: 'Test Cohort',
      code: 'TC2025',
      startDate: '2025-01-01',
      endDate: '2028-12-31',
      program: 'Test Program'
    });

    const testMode = await Mode.create({
      name: 'Online',
      description: 'Online delivery'
    });

    const facilitatorUser = await User.create({
      id: 3, // Match the token
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

    testCourseOffering = await CourseOffering.create({
      moduleId: testModule.id,
      classId: testClass.id,
      cohortId: testCohort.id,
      facilitatorId: testFacilitator.id,
      modeId: testMode.id,
      trimester: 1,
      intakePeriod: 'HT1',
      startDate: '2025-09-01',
      endDate: '2025-12-15'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Activity Log Management', () => {
    it('should allow facilitator to create activity log', async () => {
      const logData = {
        allocationId: testCourseOffering.id,
        weekNumber: 1,
        attendance: [true, true, false, true, true],
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Pending',
        summativeGrading: 'Not Started',
        courseModeration: 'Done',
        intranetSync: 'Done',
        gradeBookStatus: 'Pending',
        notes: 'Test activity log'
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(logData)
        .expect(201);

      expect(response.body.message).toBe('Activity log created successfully');
      expect(response.body.activityLog).toBeDefined();
    });

    it('should prevent duplicate activity logs for same week', async () => {
      const logData = {
        allocationId: testCourseOffering.id,
        weekNumber: 2,
        attendance: [true, true, true]
      };

      // Create first log
      await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(logData)
        .expect(201);

      // Attempt duplicate
      await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .send(logData)
        .expect(409);
    });

    it('should allow manager to view all activity logs', async () => {
      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.activityLogs).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should allow facilitator to view only their logs', async () => {
      const response = await request(app)
        .get('/api/activities/my-logs')
        .set('Authorization', `Bearer ${facilitatorToken}`)
        .expect(200);

      expect(response.body.activityLogs).toBeDefined();
    });

    it('should provide weekly summary for managers', async () => {
      const response = await request(app)
        .get('/api/activities/summary?weekNumber=1')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.weekNumber).toBe(1);
      expect(response.body.totalExpected).toBeDefined();
      expect(response.body.totalSubmitted).toBeDefined();
    });
  });
});