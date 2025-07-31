const bcrypt = require("bcrypt")

const testUsers = {
  admin: {
    email: "admin@test.com",
    password: "Admin123!",
    firstName: "Test",
    lastName: "Admin",
    role: "admin",
    isActive: true,
  },
  manager: {
    email: "manager@test.com",
    password: "Manager123!",
    firstName: "Test",
    lastName: "Manager",
    role: "manager",
    isActive: true,
  },
  facilitator: {
    email: "facilitator@test.com",
    password: "Facilitator123!",
    firstName: "Test",
    lastName: "Facilitator",
    role: "facilitator",
    isActive: true,
  },
  student: {
    email: "student@test.com",
    password: "Student123!",
    firstName: "Test",
    lastName: "Student",
    role: "student",
    isActive: true,
  },
}

const testModules = [
  {
    code: "CS101",
    name: "Introduction to Computer Science",
    description: "Basic concepts of computer science",
    credits: 3,
    level: "100",
    isActive: true,
  },
  {
    code: "CS201",
    name: "Data Structures and Algorithms",
    description: "Study of data organization and algorithmic thinking",
    credits: 4,
    level: "200",
    isActive: true,
  },
  {
    code: "SE301",
    name: "Software Engineering",
    description: "Software development methodologies",
    credits: 3,
    level: "300",
    isActive: true,
  },
]

const testClasses = [
  {
    name: "2025S",
    year: 2025,
    section: "S",
    description: "Spring 2025",
  },
  {
    name: "2025F",
    year: 2025,
    section: "F",
    description: "Fall 2025",
  },
]

const testCohorts = [
  {
    name: "Computer Science 2025",
    code: "CS2025",
    startDate: "2025-01-01",
    endDate: "2028-12-31",
    program: "Computer Science",
    isActive: true,
  },
  {
    name: "Software Engineering 2025",
    code: "SE2025",
    startDate: "2025-01-01",
    endDate: "2028-12-31",
    program: "Software Engineering",
    isActive: true,
  },
]

const testModes = [
  {
    name: "Online",
    description: "Online delivery",
    requiresPhysicalPresence: false,
  },
  {
    name: "In-person",
    description: "Traditional classroom delivery",
    requiresPhysicalPresence: true,
  },
  {
    name: "Hybrid",
    description: "Mix of online and in-person",
    requiresPhysicalPresence: true,
  },
]

const createTestCourseOffering = (moduleId, classId, cohortId, facilitatorId, modeId) => ({
  moduleId,
  classId,
  cohortId,
  facilitatorId,
  modeId,
  trimester: 1,
  intakePeriod: "HT1",
  startDate: "2025-09-01",
  endDate: "2025-12-15",
  maxStudents: 30,
  status: "active",
})

const createTestActivityLog = (allocationId, weekNumber = 1) => ({
  allocationId,
  weekNumber,
  attendance: [true, true, false, true, true],
  formativeOneGrading: "Done",
  formativeTwoGrading: "Pending",
  summativeGrading: "Not Started",
  courseModeration: "Done",
  intranetSync: "Done",
  gradeBookStatus: "Pending",
  notes: "Test activity log",
})

const createTestManager = (userId) => ({
  userId,
  employeeId: "MGR001",
  department: "Computer Science",
  managementLevel: "senior",
  canApproveAllocations: true,
})

const createTestFacilitator = (userId) => ({
  userId,
  employeeId: "FAC001",
  department: "Computer Science",
  specialization: "Software Development",
  experienceYears: 5,
  maxCourseLoad: 4,
  currentCourseLoad: 0,
  isAvailable: true,
})

const createTestStudent = (userId, cohortId) => ({
  userId,
  studentId: "202400001",
  cohortId,
  enrollmentDate: new Date(),
  expectedGraduation: new Date("2027-12-31"),
  status: "active",
})

// Helper function to hash passwords for tests
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

// JWT tokens for testing
const generateTestTokens = () => {
  const jwt = require("jsonwebtoken")
  const secret = process.env.JWT_SECRET || "test-secret"

  return {
    adminToken: jwt.sign({ id: 1, role: "admin" }, secret, { expiresIn: "1h" }),
    managerToken: jwt.sign({ id: 2, role: "manager" }, secret, { expiresIn: "1h" }),
    facilitatorToken: jwt.sign({ id: 3, role: "facilitator" }, secret, { expiresIn: "1h" }),
    studentToken: jwt.sign({ id: 4, role: "student" }, secret, { expiresIn: "1h" }),
  }
}

module.exports = {
  testUsers,
  testModules,
  testClasses,
  testCohorts,
  testModes,
  createTestCourseOffering,
  createTestActivityLog,
  createTestManager,
  createTestFacilitator,
  createTestStudent,
  hashPassword,
  generateTestTokens,
}
