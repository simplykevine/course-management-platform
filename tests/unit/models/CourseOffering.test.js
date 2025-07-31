const { sequelize, CourseOffering, Module, Class, Cohort, Facilitator, Mode } = require('../../../src/models');

describe('CourseOffering Model', () => {
  let testModule, testClass, testCohort, testFacilitator, testMode;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test data
    testModule = await Module.create({
      code: 'CS101',
      name: 'Introduction to Computer Science',
      description: 'Basic CS concepts',
      credits: 3,
      level: '100'
    });

    testClass = await Class.create({
      name: '2025S',
      year: 2025,
      section: 'S'
    });

    testCohort = await Cohort.create({
      name: 'Software Engineering 2025',
      code: 'SE2025',
      startDate: '2025-01-01',
      endDate: '2028-12-31',
      program: 'Software Engineering'
    });

    testMode = await Mode.create({
      name: 'Online',
      description: 'Online delivery'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await CourseOffering.destroy({ where: {}, force: true });
  });

  describe('Course Offering Creation', () => {
    it('should create a course offering with valid data', async () => {
      const offeringData = {
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        modeId: testMode.id,
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-09-01',
        endDate: '2025-12-15',
        maxStudents: 30
      };

      const offering = await CourseOffering.create(offeringData);

      expect(offering.id).toBeDefined();
      expect(offering.trimester).toBe(1);
      expect(offering.intakePeriod).toBe('HT1');
      expect(offering.status).toBe('planned');
      expect(offering.enrolledStudents).toBe(0);
    });

    it('should enforce unique constraint on module-class-cohort-trimester-intake combination', async () => {
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

      await CourseOffering.create(offeringData);
      await expect(CourseOffering.create(offeringData)).rejects.toThrow();
    });

    it('should validate trimester range', async () => {
      const offeringData = {
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        modeId: testMode.id,
        trimester: 4, // Invalid
        intakePeriod: 'HT1',
        startDate: '2025-09-01',
        endDate: '2025-12-15'
      };

      await expect(CourseOffering.create(offeringData)).rejects.toThrow();
    });

    it('should validate end date is after start date', async () => {
      const offeringData = {
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        modeId: testMode.id,
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-12-15',
        endDate: '2025-09-01' // Before start date
      };

      await expect(CourseOffering.create(offeringData)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let offering;

    beforeEach(async () => {
      offering = await CourseOffering.create({
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        modeId: testMode.id,
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-09-01',
        endDate: '2025-12-15',
        maxStudents: 30,
        enrolledStudents: 10,
        status: 'active'
      });
    });

    it('should check if course is available', () => {
      expect(offering.isAvailable()).toBe(true);
      
      offering.enrolledStudents = 30;
      expect(offering.isAvailable()).toBe(false);
      
      offering.status = 'completed';
      expect(offering.isAvailable()).toBe(false);
    });

    it('should calculate remaining slots', () => {
      expect(offering.getRemainingSlots()).toBe(20);
      
      offering.enrolledStudents = 30;
      expect(offering.getRemainingSlots()).toBe(0);
    });

    it('should increment enrollment', async () => {
      const initialEnrolled = offering.enrolledStudents;
      await offering.incrementEnrollment();
      
      await offering.reload();
      expect(offering.enrolledStudents).toBe(initialEnrolled + 1);
    });

    it('should not increment enrollment if course is full', async () => {
      offering.enrolledStudents = offering.maxStudents;
      await offering.save();
      
      await expect(offering.incrementEnrollment()).rejects.toThrow('Course is full');
    });

    it('should decrement enrollment', async () => {
      const initialEnrolled = offering.enrolledStudents;
      await offering.decrementEnrollment();
      
      await offering.reload();
      expect(offering.enrolledStudents).toBe(initialEnrolled - 1);
    });

    it('should not decrement enrollment below zero', async () => {
      offering.enrolledStudents = 0;
      await offering.save();
      
      await expect(offering.decrementEnrollment()).rejects.toThrow('No students enrolled');
    });
  });

  describe('Associations', () => {
    it('should load associated models', async () => {
      const offering = await CourseOffering.create({
        moduleId: testModule.id,
        classId: testClass.id,
        cohortId: testCohort.id,
        modeId: testMode.id,
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-09-01',
        endDate: '2025-12-15'
      });

      const loaded = await CourseOffering.findByPk(offering.id, {
        include: ['module', 'class', 'cohort', 'mode']
      });

      expect(loaded.module.code).toBe('CS101');
      expect(loaded.class.name).toBe('2025S');
      expect(loaded.cohort.code).toBe('SE2025');
      expect(loaded.mode.name).toBe('Online');
    });
  });
});