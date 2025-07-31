# Course Management Platform Backend Service

A comprehensive backend system for academic institutions to manage course allocations, track facilitator activities, and enhance academic coordination with role-based access control and automated notifications.

## 🎯 Project Overview

This backend system supports three core modules:
- **Course Allocation System** - Manage facilitator assignments to courses
- **Facilitator Activity Tracker (FAT)** - Track weekly activities and automate compliance monitoring
- **Student Reflection Page** - Multilingual interface with i18n/l10n support

## 🎥 Video Walkthrough

📹 **[Watch the Complete System Demo](https://youtu.be/3FvnUmShmjc)**

Get a comprehensive overview of the Course Management Platform's features, API endpoints, and functionality through our detailed video walkthrough.

## 🚀 Features

### Core Functionality
- ✅ JWT-based authentication with role management (Admin, Manager, Facilitator, Student)
- ✅ Comprehensive CRUD operations for all entities
- ✅ Redis-backed notification system with background workers
- ✅ Multilingual student reflection page (English/French)
- ✅ RESTful API design with comprehensive validation
- ✅ Real-time activity tracking and automated reminders

### Technical Highlights
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Queuing**: Redis-based notification system
- **Documentation**: Swagger/OpenAPI integration
- **Testing**: Jest unit tests for models and utilities
- **Deployment**: Github Pages

## 📋 Prerequisites

- Node.js (≥16.0.0)
- MySQL (≥8.0)
- Redis (≥6.0)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd course-management-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=course_management_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Application Configuration
PORT=3000
NODE_ENV=development
APP_NAME=Course Management Platform
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Notification Settings
NOTIFICATION_DEADLINE_HOURS=48
REMINDER_CRON_SCHEDULE=0 9 * * MON
```

### 4. Database Setup
```bash
# Sync database models
npm run migrate

# Seed with sample data (optional)
npm run seed
```

### 5. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start

# Start notification worker (separate terminal)
npm run worker
```

## 📖 Database Schema

### Core Models

#### Users & Roles
- **User**: Base user model with authentication
- **Manager**: Academic managers (assign facilitators)
- **Facilitator**: Course instructors
- **Student**: Course participants

#### Course Management
- **Module**: Academic subjects/courses
- **Class**: Academic periods (e.g., "2025S", "2025F")
- **Cohort**: Student groups by program
- **Mode**: Delivery methods (Online, In-person, Hybrid)
- **CourseOffering**: Specific course instances

#### Activity Tracking
- **ActivityTracker**: Weekly facilitator activity logs

### Key Relationships
```
User (1:1) → Manager/Facilitator/Student
CourseOffering (N:1) → Module, Class, Cohort, Facilitator, Mode
ActivityTracker (N:1) → CourseOffering
Student (N:1) → Cohort
```

## 🔐 Authentication Flow

### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "facilitator",
  "employeeId": "EMP001",
  "department": "Computer Science",
  "specialization": "Software Development"
}
```

### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@university.edu",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john.doe@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "facilitator"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiFs..."
  }
}
```

### 3. Protected Routes
Include the JWT token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📚 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

#### Course Management
- `GET /api/courses` - List course offerings (with filters)
- `POST /api/courses` - Create course offering *(Manager only)*
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course offering *(Manager only)*
- `DELETE /api/courses/:id` - Delete course offering *(Manager only)*
- `GET /api/courses/my-courses` - Get facilitator's assigned courses
- `POST /api/courses/:id/assign-facilitator` - Assign facilitator *(Manager only)*

#### Module Management
- `GET /api/courses/modules` - List all modules
- `POST /api/courses/modules` - Create module *(Manager only)*

#### Activity Tracking
- `GET /api/activities` - List activity logs
- `POST /api/activities` - Create activity log *(Facilitator only)*
- `GET /api/activities/:id` - Get activity log details
- `PUT /api/activities/:id` - Update activity log
- `DELETE /api/activities/:id` - Delete activity log *(Manager only)*
- `GET /api/activities/my-logs` - Get facilitator's logs
- `GET /api/activities/summary` - Weekly summary *(Manager only)*

#### User Management
- `GET /api/users` - List all users *(Admin only)*
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user *(Admin only)*
- `PATCH /api/users/:id/deactivate` - Deactivate user *(Admin only)*
- `DELETE /api/users/:id` - Delete user *(Admin only)*
- `GET /api/users/stats` - User statistics *(Admin only)*

### Sample API Calls

#### Create Course Offering
```http
POST /api/courses
Authorization: Bearer <manager-token>
Content-Type: application/json

{
  "moduleId": 1,
  "classId": 1,
  "cohortId": 1,
  "facilitatorId": 1,
  "modeId": 1,
  "trimester": 1,
  "intakePeriod": "HT1",
  "startDate": "2025-09-01",
  "endDate": "2025-12-15",
  "maxStudents": 30
}
```

#### Submit Activity Log
```http
POST /api/activities
Authorization: Bearer <facilitator-token>
Content-Type: application/json

{
  "allocationId": 1,
  "weekNumber": 1,
  "attendance": [true, true, false, true, true],
  "formativeOneGrading": "Done",
  "formativeTwoGrading": "Pending",
  "summativeGrading": "Not Started",
  "courseModeration": "Done",
  "intranetSync": "Done",
  "gradeBookStatus": "Pending",
  "notes": "Student 3 was absent due to illness"
}
```

## 📊 Filtering & Pagination

Most list endpoints support filtering and pagination:

```http
GET /api/courses?trimester=1&status=active&facilitatorId=1&page=1&limit=10
GET /api/activities?weekNumber=1&status=complete&page=2&limit=5
GET /api/users?role=facilitator&isActive=true&search=john
```

**Pagination Response Format:**
```json
{
  "courseOfferings": [...],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔔 Notification System

### Redis-Backed Queues
- **Notification Queue**: Handles email notifications
- **Reminder Queue**: Processes automated reminders

### Automated Features
- **Weekly Reminders**: Sent to facilitators who haven't submitted activity logs
- **Manager Alerts**: Notifications about missing submissions and deadline violations
- **Submission Confirmations**: Automatic alerts when activity logs are completed

### Background Worker
Start the notification worker separately:
```bash
npm run worker
```

## 🌍 Internationalization (i18n)

### Student Reflection Page
The multilingual reflection page is available at `/reflection` and supports:
- **English** (default)
- **French** (Français)

### Features
- Dynamic language switching
- Persistent language preference (localStorage)
- Browser language detection
- Form auto-save functionality

### Translation Structure
```javascript
const translations = {
  en: {
    pageTitle: "Course Reflection",
    question1: "What did you enjoy most about the course?",
    // ...
  },
  fr: {
    pageTitle: "Réflexion sur le cours",
    question1: "Qu'avez-vous le plus apprécié dans ce cours ?",
    // ...
  }
};
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **Model Tests**: User, CourseOffering, ActivityTracker validation
- **Utility Tests**: Helper functions, validators, formatters
- **Integration Tests**: Authentication, course allocation, activity tracking
- **API Tests**: Complete endpoint testing with role verification

### Sample Test Data
The system includes comprehensive test fixtures and database seeding:
```bash
# Seed development database
npm run seed
```

**Default Test Credentials:**
- **Admin**: `admin@university.edu` / `Admin123!`
- **Manager**: `sarah.johnson@university.edu` / `Manager123!`
- **Facilitator**: `john.doe@university.edu` / `Facilitator123!`
- **Student**: `student1@university.edu` / `Student123!`

## 📝 Validation & Error Handling

### Input Validation
- **Email Format**: RFC-compliant email validation
- **Password Strength**: Minimum 8 characters with complexity requirements
- **Role Validation**: Enum-based role checking
- **Date Validation**: Proper date range validation
- **Array Validation**: Type-safe attendance arrays

### Error Response Format
```json
{
  "error": "Validation failed",
  "message": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden / Insufficient Permissions
- `404` - Not Found
- `409` - Conflict / Duplicate Entry
- `500` - Internal Server Error

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions by user role
- **Password Hashing**: bcrypt with configurable salt rounds
- **Token Refresh**: Automatic token renewal mechanism

### Security Middleware
- **Helmet**: Security headers protection
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request throttling per IP
- **Input Sanitization**: XSS and injection prevention
- **Parameterized Queries**: SQL injection protection

### Environment Security
```env
# Strong JWT secrets (minimum 32 characters)
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key

# Database credentials
DB_PASSWORD=strong-database-password

# Email credentials
EMAIL_PASSWORD=app-specific-password
```


### Environment-Specific Configurations
- **Development**: Full logging, auto-reload, seed data
- **Production**: Optimized logging, error tracking, health checks
- **Testing**: Isolated database, mocked external services

## 📊 Monitoring & Health Checks

### Health Endpoints
- `GET /health` - Basic application health
- `GET /api/monitoring/redis` - Redis connection status
- `GET /api/monitoring/mysql` - Database connection status
- `GET /api/monitoring/status` - Complete system status

### Logging
- **Winston Logger**: Structured logging with multiple transports
- **Request Logging**: Morgan middleware for HTTP request logs
- **Error Tracking**: Comprehensive error logging with stack traces
- **Performance Monitoring**: Response time tracking

## 🤝 Contributing

### Code Standards
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages
- **Documentation**: Comprehensive JSDoc comments

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run linting and tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MySQL service
mysql -u root -p -e "SELECT 1"

# Verify database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'course_management_db'"
```

#### Redis Connection
```bash
# Test Redis connection
redis-cli ping
```

#### Port Conflicts
```bash
# Check if port 3000 is in use
lsof -i :3000

# Use different port
PORT=3001 npm start
```

### Development Commands
```bash
# Database operations
npm run migrate          # Run database migrations
npm run migrate:undo     # Undo last migration
npm run seed            # Seed database with sample data

# Development tools
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run dev             # Start with nodemon
npm run worker          # Start background worker

# Testing
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## 📞 Contact & Support

For questions, issues, or contributions:
- **GitHub Issues**: Use the repository issues page
- **Documentation**: Check the `/api-docs` endpoint when running
- **Email**: p.mayala@alustudent.com

---