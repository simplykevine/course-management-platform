Course Management Platform Backend Service
A robust backend system designed for academic institutions to manage course allocations, monitor facilitator activities, and streamline academic coordination. Features role-based access control, automated notifications, and multilingual support.

🚀 Features
Core Modules
Course Allocation System: Manage facilitator-course assignments efficiently

Facilitator Activity Tracker (FAT): Track weekly activities and automate compliance monitoring

Student Reflection Page: Multilingual interface supporting English and French with i18n/l10n

Technical Highlights
JWT-based authentication with granular role management (Admin, Manager, Facilitator, Student)

Full CRUD operations for all entities with validation

Redis-powered notification system with background workers

RESTful API design with Swagger/OpenAPI documentation

MySQL database managed via Sequelize ORM

Passwords hashed securely using bcrypt

Comprehensive Jest tests (unit, integration, API)

Deployment ready with environment-based configuration

📋 Prerequisites
Node.js (≥16.0.0)

MySQL (≥8.0)

Redis (≥6.0)

npm or yarn

🛠 Installation & Setup
1. Clone the repo
bash
Copy
Edit
git clone <repository-url>
cd course-management-platform
2. Install dependencies
bash
Copy
Edit
npm install
3. Configure environment variables
Create a .env file at the root:

env
Copy
Edit
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dbdb
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# App Config
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
4. Setup database
bash
Copy
Edit
npm run migrate         # Run migrations
npm run seed            # (Optional) Seed sample data
5. Start the app
bash
Copy
Edit
npm run dev             # Development mode
npm start               # Production mode

# In a separate terminal, start the notification worker
npm run worker
📖 Database Schema Overview
Main Models
User: Base entity for authentication

Manager: Academic coordinators

Facilitator: Course instructors

Student: Course participants

Module: Academic courses

Class: Academic terms/periods (e.g., “2025S”)

Cohort: Student groups by program

Mode: Course delivery methods (Online, In-person, Hybrid)

CourseOffering: Specific course instances

ActivityTracker: Weekly facilitator activity logs

Relationships
User has one role: Manager, Facilitator, or Student

CourseOffering belongs to Module, Class, Cohort, Facilitator, and Mode

ActivityTracker linked to CourseOffering

Student belongs to Cohort

🔐 Authentication Flow
Register: POST /api/auth/register

Login: POST /api/auth/login

Protected Routes: Include JWT in Authorization: Bearer <token> header

📚 API Overview
Auth: register, login, refresh token, profile, password change, logout

Courses: CRUD, assignment management (Manager only)

Modules: List and create (Manager only)

Activities: CRUD, summaries, facilitator-specific logs

Users: Admin-only management and stats

(See full API docs via Swagger at /api-docs)

🔔 Notification System
Redis-backed queues handle email notifications and reminders

Automated weekly reminders for missing facilitator logs

Manager alerts on deadline violations

Submission confirmations via email

Background worker runs separately (npm run worker)

🌍 Internationalization (i18n)
Student reflection page supports English and French

Features language detection, persistent preference, and auto-save

Translation files structured for easy extension

🧪 Testing
Run all tests: npm test

Coverage report: npm run test:coverage

Watch mode: npm run test:watch

Test fixtures included for all roles and models

📝 Validation & Error Handling
Robust input validation (email format, password strength, roles, dates, arrays)

Consistent error response format with detailed messages

Standard HTTP status codes applied

🛡️ Security
JWT authentication with role-based access

Password hashing with bcrypt

Helmet, CORS, rate limiting, and input sanitization middleware

Parameterized queries prevent SQL injection

Environment secrets management

📊 Monitoring & Health Checks
Health endpoints for app, Redis, and MySQL status

Winston for structured logging and error tracking

Morgan HTTP request logging

Performance metrics and response time monitoring

🤝 Contributing
ESLint and Prettier enforced

Conventional commits encouraged

Fork, branch, test, lint, PR workflow

📄 License
MIT License — see LICENSE

🆘 Support & Troubleshooting
Common Issues
Verify MySQL:
mysql -u root -p -e "SHOW DATABASES LIKE ''"

Verify Redis:
redis-cli ping

Check port usage:
lsof -i :3000

Dev Commands
npm run migrate, npm run seed

npm run lint, npm run lint:fix

npm run dev, npm run worker

npm test
