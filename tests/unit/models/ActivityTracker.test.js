const { sequelize, ActivityTracker, CourseOffering, Module, Class, Cohort, Mode } = require('../../../src/models');

describe('ActivityTracker Model', () => {
  let testCourseOffering;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Create test dependencies
    const testModule = await Module.create({
      code: 'CS201',
      name: 'Data Structures',
      credits: 3,
      level: '200'
    });

    const testClass = await Class.create({
      name: '2025F',
      year: 2025,
      section: 'F'
    });

    const testCohort = await Cohort.create({
      name: 'Computer Science 2025',
      code: 'CS2025',
      startDate: '2025-01-01',
      endDate: '2028-12-31',
      program: 'Computer Science'
    });

    const testMode = await Mode.create({
      name: 'In-person',
      description: 'In-person delivery'
    });

    testCourseOffering = await CourseOffering.create({
      moduleId: testModule.id,
      classId: testClass.id,
      cohortId: testCohort.id,
      modeId: testMode.id,
      trimester: 1,
      intakePeriod: 'FT',
      startDate: '2025-09-01',
      endDate: '2025-12-15'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await ActivityTracker.destroy({ where: {}, force: true });
  });

  describe('Activity Tracker Creation', () => {
    it('should create an activity log with valid data', async () => {
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
        notes: 'Student 3 was absent'
      };

      const log = await ActivityTracker.create(logData);

      expect(log.id).toBeDefined();
      expect(log.weekNumber).toBe(1);
      expect(log.attendance).toEqual([true, true, false, true, true]);
      expect(log.formativeOneGrading).toBe('Done');
      expect(log.reminderCount).toBe(0);
    });

    it('should enforce unique constraint on allocation-week combination', async () => {
      const logData = {
        allocationId: testCourseOffering.id,
        weekNumber: 1,
        attendance: [true, true, true]
      };

      await ActivityTracker.create(logData);
      await expect(ActivityTracker.create(logData)).rejects.toThrow();
    });

    it('should validate attendance array contains only booleans', async () => {
      const logData = {
        allocationId: testCourseOffering.id,
        weekNumber: 1,
        attendance: [true, 'present', false] // Invalid
      };

      await expect(ActivityTracker.create(logData)).rejects.toThrow();
    });

    it('should validate week number range', async () => {
      const logData = {
        allocationId: testCourseOffering.id,
        weekNumber: 17, // Invalid (max is 16)
        attendance: [true, true]
      };

      await expect(ActivityTracker.create(logData)).rejects.toThrow();
    });

    it('should validate grading status enum values', async () => {
      const logData = {
        allocationId: testCourseOffering.id,
        weekNumber: 1,
        attendance: [true],
        formativeOneGrading: 'Complete' // Invalid enum value
      };

      await expect(ActivityTracker.create(logData)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let activityLog;

    beforeEach(async () => {
      activityLog = await ActivityTracker.create({
        allocationId: testCourseOffering.id,
        weekNumber: 1,
        attendance: [true, true, false, true],
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Done',
        summativeGrading: 'Pending',
        courseModeration: 'Done',
        intranetSync: 'Done',
        gradeBookStatus: 'Not Started'
      });
    });

    it('should check if activity log is complete', () => {
      expect(activityLog.isComplete()).toBe(false);

      activityLog.summativeGrading = 'Done';
      activityLog.gradeBookStatus = 'Done';
      expect(activityLog.isComplete()).toBe(true);
    });

    it('should calculate completion percentage', () => {
      // 4 out of 6 tasks done + attendance = 5/7 = ~71%
      expect(activityLog.getCompletionPercentage()).toBe(71);

      activityLog.summativeGrading = 'Done';
      activityLog.gradeBookStatus = 'Done';
      expect(activityLog.getCompletionPercentage()).toBe(100);

      // Test with no attendance
      activityLog.attendance = [];
      expect(activityLog.getCompletionPercentage()).toBe(86); // 6/7
    });

    it('should mark as submitted', async () => {
      expect(activityLog.submittedAt).toBeNull();

      await activityLog.markSubmitted();
      await activityLog.reload();

      expect(activityLog.submittedAt).toBeDefined();
      expect(activityLog.submittedAt).toBeInstanceOf(Date);
    });

    it('should increment reminder count', async () => {
      expect(activityLog.reminderCount).toBe(0);
      expect(activityLog.lastReminderSent).toBeNull();

      await activityLog.incrementReminderCount();
      await activityLog.reload();

      expect(activityLog.reminderCount).toBe(1);
      expect(activityLog.lastReminderSent).toBeDefined();
    });
  });

  describe('Default Values', () => {
    it('should set default values for grading statuses', async () => {
      const log = await ActivityTracker.create({
        allocationId: testCourseOffering.id,
        weekNumber: 2,
        attendance: [true]
      });

      expect(log.formativeOneGrading).toBe('Not Started');
      expect(log.formativeTwoGrading).toBe('Not Started');
      expect(log.summativeGrading).toBe('Not Started');
      expect(log.courseModeration).toBe('Not Started');
      expect(log.intranetSync).toBe('Not Started');
      expect(log.gradeBookStatus).toBe('Not Started');
    });
  });
});