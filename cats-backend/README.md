# CATS Backend - Complaint and Application Tracking System

A comprehensive, secure, and scalable backend system for managing complaints and applications in a district-level Cyber Crime Branch.

## 🚀 Features

### Core Functionality

- **User Management**: Multi-role user system with RBAC (Role-Based Access Control)
- **Complaint Management**: Complete complaint lifecycle from submission to resolution
- **Application Management**: Handle various applications (NOC, clearances, etc.)
- **Evidence Management**: Secure file upload and management with chain of custody
- **Case Timeline**: Detailed tracking of all case activities
- **Communication**: Secure messaging between users and officers
- **Audit Logging**: Comprehensive audit trail for compliance

### Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based permissions with fine-grained access control
- **Data Encryption**: Sensitive data encryption at rest
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Input Validation**: Comprehensive input sanitization and validation
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Parameterized queries and input validation
- **XSS Protection**: Content sanitization and CSP headers

### Advanced Features

- **SLA Management**: Automated SLA tracking and escalation
- **Notification System**: Multi-channel notifications (Email, SMS)
- **Analytics & Reporting**: Comprehensive reporting and analytics
- **File Management**: Secure file upload with virus scanning
- **Workflow Automation**: Configurable workflows and auto-assignment
- **System Settings**: Dynamic system configuration
- **Backup & Recovery**: Automated backup and recovery mechanisms

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Caching**: Redis
- **File Storage**: Local filesystem (configurable for cloud storage)
- **Logging**: Winston
- **Validation**: Joi + express-validator
- **Security**: Helmet, bcrypt, rate limiting

### Database Schema

The system includes 17+ comprehensive database models:

- Users, Roles, Permissions
- Complaints, Applications, Appeals
- Evidence, Messages, Timeline
- Audit Logs, Notifications
- System Settings, SLA Rules

## 📦 Installation

### Prerequisites

- Node.js 18.0 or higher
- PostgreSQL 12.0 or higher
- Redis 6.0 or higher (optional, for caching)
- Git

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cats-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your NeonDB connection string
   ```

4. **Database Setup**

   ```bash
   # Option 1: Run complete setup (Recommended)
   npm run setup

   # Option 2: Manual setup
   npm run create-tables  # Create database tables
   npm run seed-data      # Add initial data

   # Option 3: Test connection only
   npm run test-db
   ```

5. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

#### Required Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cats_db
DB_USER=cats_user
DB_PASSWORD=your_secure_password

# JWT Secrets
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_minimum_32_characters

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

#### Optional Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_email_password

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Database Configuration

The system uses PostgreSQL with Sequelize ORM. Database configuration is in `src/config/database.js`.

#### Migration Commands

```bash
# Run all migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Run seeders
npm run seed

# Undo all seeders
npm run seed:undo
```

## 🔐 Security

### Authentication Flow

1. User registers/logs in with email and password
2. System returns JWT access token (15 min) and refresh token (7 days)
3. Client includes access token in Authorization header
4. System validates token and user permissions for each request

### Role-Based Access Control (RBAC)

- **Super Admin**: Full system access
- **Admin**: User and case management
- **Senior Officer**: Case supervision and assignment
- **Officer**: Case investigation and updates
- **Junior Officer**: Limited investigation access
- **Clerk**: Data entry and basic operations
- **Citizen**: File complaints and applications

### Data Protection

- Sensitive fields (Aadhaar, PAN) are encrypted at rest
- Passwords are hashed using bcrypt with 12 rounds
- Audit logs track all sensitive operations
- Soft deletes preserve data integrity

## 📊 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

```
POST /auth/register          - User registration
POST /auth/login             - User login
POST /auth/refresh           - Refresh access token
POST /auth/logout            - User logout
POST /auth/forgot-password   - Request password reset
POST /auth/reset-password    - Reset password
GET  /auth/verify-email/:token - Verify email
POST /auth/verify-phone      - Verify phone number
```

### Complaint Endpoints

```
GET  /complaints             - List complaints (with filters)
POST /complaints             - Submit new complaint
GET  /complaints/:id         - Get complaint details
PUT  /complaints/:id/status  - Update complaint status (officers)
GET  /complaints/:id/timeline - Get complaint timeline
POST /complaints/:id/evidence - Upload evidence
POST /complaints/:id/messages - Send message
GET  /complaints/:id/messages - Get messages
```

### Application Endpoints

```
GET  /applications           - List applications
POST /applications           - Submit new application
GET  /applications/:id       - Get application details
PUT  /applications/:id/status - Update application status
```

### Admin Endpoints

```
GET  /admin/dashboard        - Admin dashboard
GET  /admin/users            - User management
GET  /admin/reports          - Generate reports
GET  /admin/settings         - System settings
GET  /admin/audit-logs       - Audit logs
```

### Public Endpoints

```
GET  /public/complaint-types - Get complaint types
GET  /public/statistics      - Public statistics
POST /public/anonymous-complaint - Submit anonymous complaint
GET  /public/complaint-status/:number - Check complaint status
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 📈 Monitoring & Logging

### Logging

The system uses Winston for comprehensive logging:

- **Application logs**: `logs/cats.log`
- **Error logs**: `logs/error.log`
- **Security logs**: `logs/security.log`
- **Audit logs**: Database table with retention

### Log Levels

- **error**: System errors and exceptions
- **warn**: Security events and warnings
- **info**: General application events
- **debug**: Detailed debugging information

### Monitoring Endpoints

```
GET /health                  - Health check
GET /api/docs               - API documentation
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**

   ```bash
   NODE_ENV=production
   # Set all required environment variables
   ```

2. **Database Migration**

   ```bash
   npm run migrate
   ```

3. **Start Application**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile included in project
docker build -t cats-backend .
docker run -p 3000:3000 cats-backend
```

### Docker Compose

```yaml
# docker-compose.yml included
docker-compose up -d
```

## 🔧 Development

### Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic services
├── utils/          # Utility functions
├── seeders/        # Database seeders
└── migrations/     # Database migrations
```

### Code Style

- ESLint configuration included
- Prettier for code formatting
- Husky for pre-commit hooks

### Development Commands

```bash
npm run dev         # Start development server
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier
```

## 📋 Default Users

After running seeders, the following users are available:

| Role           | Email                            | Password                |
| -------------- | -------------------------------- | ----------------------- |
| Super Admin    | admin@cybercrime.gov.in          | SecureAdminPassword123! |
| Admin          | admin@cybercrime.gov.in          | AdminPassword123!       |
| Senior Officer | senior.officer@cybercrime.gov.in | OfficerPassword123!     |
| Officer        | officer1@cybercrime.gov.in       | OfficerPassword123!     |
| Citizen        | citizen.test@example.com         | CitizenPassword123!     |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

### v1.0.0 (Current)

- Initial release
- Complete RBAC system
- Complaint and application management
- Security features
- Audit logging
- API documentation

## 🎯 Roadmap

### Upcoming Features

- Mobile app API enhancements
- Advanced analytics dashboard
- Machine learning for complaint classification
- Integration with external systems
- Multi-language support
- Advanced reporting features

---

**Built with ❤️ for Digital India Initiative**
