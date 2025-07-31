require('dotenv').config();
const { 
  sequelize, 
  User, 
  Manager, 
  Facilitator, 
  Student, 
  Module, 
  Class, 
  Cohort, 
  Mode,
  CourseOffering,
  ActivityTracker 
} = require('../models');
const logger = require('./logger');

const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    logger.info('Database synced successfully');

    // Create Modes
    const modes = await Mode.bulkCreate([
      { name: 'Online', description: 'Online delivery', requiresPhysicalPresence: false },
      { name: 'In-person', description: 'Traditional classroom delivery', requiresPhysicalPresence: true },
      { name: 'Hybrid', description: 'Mix of online and in-person', requiresPhysicalPresence: true }
    ]);
    logger.info('Modes created');

    // Create Classes
    const classes = await Class.bulkCreate([
      { name: '2024S', year: 2024, section: 'S', description: 'Spring 2024' },
      { name: '2024F', year: 2024, section: 'F', description: 'Fall 2024' },
      { name: '2025S', year: 2025, section: 'S', description: 'Spring 2025' },
      { name: '2025F', year: 2025, section: 'F', description: 'Fall 2025' }
    ]);
    logger.info('Classes created');

    // Create Cohorts
    const cohorts = await Cohort.bulkCreate([
      {
        name: 'Software Engineering 2024',
        code: 'SE2024',
        startDate: '2024-01-01',
        endDate: '2027-12-31',
        program: 'Software Engineering'
      },
      {
        name: 'Computer Science 2024',
        code: 'CS2024',
        startDate: '2024-01-01',
        endDate: '2027-12-31',
        program: 'Computer Science'
      },
      {
        name: 'Data Science 2025',
        code: 'DS2025',
        startDate: '2025-01-01',
        endDate: '2028-12-31',
        program: 'Data Science'
      }
    ]);
    logger.info('Cohorts created');

    // Create Modules
    const modules = await Module.bulkCreate([
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science',
        credits: 3,
        level: '100'
      },
      {
        code: 'CS201',
        name: 'Data Structures and Algorithms',
        description: 'Study of data organization and algorithmic thinking',
        credits: 4,
        level: '200'
      },
      {
        code: 'SE101',
        name: 'Software Engineering Principles',
        description: 'Introduction to software development methodologies',
        credits: 3,
        level: '100'
      },
      {
        code: 'DB201',
        name: 'Database Management Systems',
        description: 'Design and implementation of database systems',
        credits: 3,
        level: '200'
      },
      {
        code: 'WEB301',
        name: 'Web Development',
        description: 'Modern web application development',
        credits: 4,
        level: '300'
      }
    ]);
    logger.info('Modules created');

    // Create Admin User
    const adminUser = await User.create({
      email: 'admin@university.edu',
      password: 'Admin123!',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin'
    });
    logger.info('Admin user created');

    // Create Managers
    const manager1User = await User.create({
      email: 'sarah.johnson@university.edu',
      password: 'Manager123!',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'manager'
    });
    const manager1 = await Manager.create({
      userId: manager1User.id,
      employeeId: 'EMP001',
      department: 'Computer Science',
      managementLevel: 'senior'
    });

    const manager2User = await User.create({
      email: 'michael.chen@university.edu',
      password: 'Manager123!',
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'manager'
    });
    const manager2 = await Manager.create({
      userId: manager2User.id,
      employeeId: 'EMP002',
      department: 'Software Engineering',
      managementLevel: 'middle'
    });
    logger.info('Managers created');

    // Create Facilitators
    const facilitator1User = await User.create({
      email: 'john.doe@university.edu',
      password: 'Facilitator123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'facilitator'
    });
    const facilitator1 = await Facilitator.create({
      userId: facilitator1User.id,
      employeeId: 'EMP101',
      department: 'Computer Science',
      specialization: 'Algorithms and Data Structures',
      experienceYears: 5,
      maxCourseLoad: 4
    });

    const facilitator2User = await User.create({
      email: 'jane.smith@university.edu',
      password: 'Facilitator123!',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'facilitator'
    });
    const facilitator2 = await Facilitator.create({
      userId: facilitator2User.id,
      employeeId: 'EMP102',
      department: 'Software Engineering',
      specialization: 'Web Development',
      experienceYears: 7,
      maxCourseLoad: 3
    });

    const facilitator3User = await User.create({
      email: 'robert.wilson@university.edu',
      password: 'Facilitator123!',
      firstName: 'Robert',
      lastName: 'Wilson',
      role: 'facilitator'
    });
    const facilitator3 = await Facilitator.create({
      userId: facilitator3User.id,
      employeeId: 'EMP103',
      department: 'Computer Science',
      specialization: 'Database Systems',
      experienceYears: 10,
      maxCourseLoad: 3
    });
    logger.info('Facilitators created');

    // Create Students
    const students = [];
    for (let i = 1; i <= 10; i++) {
      const studentUser = await User.create({
        email: `student${i}@university.edu`,
        password: 'Student123!',
        firstName: `Student${i}`,
        lastName: `Test${i}`,
        role: 'student'
      });
      
      const student = await Student.create({
        userId: studentUser.id,
        studentId: `2024000${i.toString().padStart(3, '0')}`,
        cohortId: cohorts[i % 3].id,
        enrollmentDate: new Date(),
        expectedGraduation: new Date('2027-12-31'),
        status: 'active'
      });
      students.push(student);
    }
    logger.info('Students created');

    // Create Course Offerings
    const courseOfferings = await CourseOffering.bulkCreate([
      {
        moduleId: modules[0].id, // CS101
        classId: classes[2].id, // 2025S
        cohortId: cohorts[0].id, // SE2024
        facilitatorId: facilitator1.id,
        modeId: modes[0].id, // Online
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-01-15',
        endDate: '2025-04-30',
        maxStudents: 30,
        status: 'active'
      },
      {
        moduleId: modules[1].id, // CS201
        classId: classes[2].id, // 2025S
        cohortId: cohorts[1].id, // CS2024
        facilitatorId: facilitator1.id,
        modeId: modes[1].id, // In-person
        trimester: 1,
        intakePeriod: 'HT1',
        startDate: '2025-01-15',
        endDate: '2025-04-30',
        maxStudents: 25,
        status: 'active'
      },
      {
        moduleId: modules[2].id, // SE101
        classId: classes[2].id, // 2025S
        cohortId: cohorts[0].id, // SE2024
        facilitatorId: facilitator2.id,
        modeId: modes[2].id, // Hybrid
        trimester: 1,
        intakePeriod: 'FT',
        startDate: '2025-01-15',
        endDate: '2025-04-30',
        maxStudents: 35,
        status: 'active'
      },
      {
        moduleId: modules[3].id, // DB201
        classId: classes[2].id, // 2025S
        cohortId: cohorts[1].id, // CS2024
        facilitatorId: facilitator3.id,
        modeId: modes[0].id, // Online
        trimester: 2,
        intakePeriod: 'HT2',
        startDate: '2025-05-01',
        endDate: '2025-08-15',
        maxStudents: 20,
        status: 'planned'
      }
    ]);
    logger.info('Course offerings created');

    // Update facilitator course loads
    await facilitator1.update({ currentCourseLoad: 2 });
    await facilitator2.update({ currentCourseLoad: 1 });
    await facilitator3.update({ currentCourseLoad: 1 });

    // Create sample Activity Logs
    const activityLogs = await ActivityTracker.bulkCreate([
      {
        allocationId: courseOfferings[0].id,
        weekNumber: 1,
        attendance: [true, true, false, true, true],
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Done',
        summativeGrading: 'Pending',
        courseModeration: 'Done',
        intranetSync: 'Done',
        gradeBookStatus: 'Pending',
        submittedAt: new Date(),
        notes: 'Week 1 completed'
      },
      {
        allocationId: courseOfferings[1].id,
        weekNumber: 1,
        attendance: [true, true, true, true, false, true],
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Pending',
        summativeGrading: 'Not Started',
        courseModeration: 'Pending',
        intranetSync: 'Done',
        gradeBookStatus: 'Not Started'
      },
      {
        allocationId: courseOfferings[2].id,
        weekNumber: 1,
        attendance: [true, true, true, true, true, true, true],
        formativeOneGrading: 'Done',
        formativeTwoGrading: 'Done',
        summativeGrading: 'Done',
        courseModeration: 'Done',
        intranetSync: 'Done',
        gradeBookStatus: 'Done',
        submittedAt: new Date(),
        notes: 'All tasks completed for week 1'
      }
    ]);
    logger.info('Activity logs created');

    logger.info('Database seeding completed successfully!');
    logger.info('\nLogin Credentials:');
    logger.info('Admin: admin@university.edu / Admin123!');
    logger.info('Manager: sarah.johnson@university.edu / Manager123!');
    logger.info('Facilitator: john.doe@university.edu / Facilitator123!');
    logger.info('Student: student1@university.edu / Student123!');

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedDatabase;