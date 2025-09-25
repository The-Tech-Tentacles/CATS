# CATS Backend Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL 12.0 or higher
- Redis 6.0 or higher (optional)
- Git

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd cats-backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cats_db
DB_USER=cats_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_here_minimum_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Configuration
ENCRYPTION_KEY=your_32_character_encryption_key_here
ENCRYPTION_ALGORITHM=aes-256-gcm

# Server Configuration
PORT=3000
NODE_ENV=development
TRUST_PROXY=false

# Security Configuration
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@cybercrime.gov.in
FROM_NAME=Cyber Crime Branch

# SMS Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Admin Configuration
SUPER_ADMIN_EMAIL=admin@cybercrime.gov.in
SUPER_ADMIN_PASSWORD=SecureAdminPassword123!

# Logging
LOG_LEVEL=info
LOG_FILE=logs/cats.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb cats_db

# Run database migrations
npm run migrate

# Seed initial data
npm run seed
```

### 4. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Detailed Setup

### Database Configuration

#### PostgreSQL Setup
```sql
-- Create database user
CREATE USER cats_user WITH PASSWORD 'your_secure_password';

-- Create database
CREATE DATABASE cats_db OWNER cats_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cats_db TO cats_user;
```

#### Environment-specific Configurations

**Development:**
```env
NODE_ENV=development
DB_LOGGING=true
LOG_LEVEL=debug
```

**Production:**
```env
NODE_ENV=production
DB_LOGGING=false
LOG_LEVEL=info
TRUST_PROXY=true
```

### Security Configuration

#### SSL/TLS Setup (Production)
```env
# Enable HTTPS
HTTPS_ENABLED=true
SSL_CERT_PATH=/path/to/certificate.crt
SSL_KEY_PATH=/path/to/private.key
```

#### Rate Limiting Configuration
```env
# Authentication endpoints
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Password reset
PASSWORD_RESET_RATE_LIMIT_WINDOW_MS=3600000
PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS=3

# File upload
UPLOAD_RATE_LIMIT_WINDOW_MS=900000
UPLOAD_RATE_LIMIT_MAX_REQUESTS=20
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f cats-backend

# Stop services
docker-compose down
```

### Custom Docker Build

```bash
# Build image
docker build -t cats-backend .

# Run container
docker run -d \
  --name cats-backend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your_db_host \
  -e DB_PASSWORD=your_db_password \
  cats-backend
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t cats-backend .
docker tag cats-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/cats-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/cats-backend:latest
```

#### Environment Variables for AWS
```env
# Database (RDS)
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_NAME=cats_db
DB_USER=cats_user
DB_PASSWORD=your_secure_password

# Redis (ElastiCache)
REDIS_HOST=your-elasticache-endpoint.amazonaws.com
REDIS_PORT=6379

# File Storage (S3)
AWS_REGION=us-east-1
AWS_S3_BUCKET=cats-file-storage
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Google Cloud Platform

#### Using Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/cats-backend
gcloud run deploy cats-backend \
  --image gcr.io/your-project/cats-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### Using Azure Container Instances
```bash
# Create resource group
az group create --name cats-rg --location eastus

# Deploy container
az container create \
  --resource-group cats-rg \
  --name cats-backend \
  --image cats-backend:latest \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

## 🔍 Monitoring & Logging

### Application Monitoring

#### Health Checks
```bash
# Basic health check
curl http://localhost:3000/health

# Detailed status
curl http://localhost:3000/api/docs
```

#### Log Monitoring
```bash
# View application logs
tail -f logs/cats.log

# View error logs
tail -f logs/error.log

# View security logs
tail -f logs/security.log
```

### Performance Monitoring

#### Using PM2 (Production)
```bash
# Install PM2
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs
```

#### PM2 Configuration (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'cats-backend',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    time: true
  }]
};
```

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies
npm install

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:security

# Run tests with coverage
npm run test:coverage

# Run custom test runner (no dependencies)
node test-runner.js
```

### Test Environment Setup

```bash
# Create test database
createdb cats_test_db

# Set test environment
export NODE_ENV=test
export DB_NAME=cats_test_db

# Run tests
npm test
```

## 🔒 Security Checklist

### Pre-deployment Security Checks

- [ ] All environment variables are properly configured
- [ ] Database credentials are secure and rotated
- [ ] JWT secrets are cryptographically secure (32+ characters)
- [ ] Encryption keys are properly generated and stored
- [ ] HTTPS is enabled in production
- [ ] Rate limiting is configured appropriately
- [ ] File upload restrictions are in place
- [ ] Audit logging is enabled
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies are up to date and scanned for vulnerabilities

### Production Security Configuration

```env
# Production security settings
NODE_ENV=production
TRUST_PROXY=true
HTTPS_ENABLED=true
SECURE_COOKIES=true
CSRF_PROTECTION=true
HELMET_ENABLED=true
RATE_LIMITING_ENABLED=true
AUDIT_LOGGING_ENABLED=true
```

## 📊 Performance Optimization

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Caching Configuration

```env
# Redis caching
CACHE_ENABLED=true
CACHE_TTL=3600
SESSION_CACHE_TTL=1800
RATE_LIMIT_CACHE_TTL=900
```

### Load Balancing

#### Nginx Configuration
```nginx
upstream cats_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://cats_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔄 Backup & Recovery

### Database Backup

```bash
# Create backup
pg_dump -h localhost -U cats_user cats_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U cats_user cats_db < backup_20240115_120000.sql
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/path/to/backups"
DB_NAME="cats_db"
DB_USER="cats_user"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### File Backup

```bash
# Backup uploaded files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Backup logs
tar -czf logs_backup_$(date +%Y%m%d).tar.gz logs/
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
psql -h localhost -U cats_user -d cats_db -c "SELECT 1;"
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Check Node.js memory usage
node --max-old-space-size=4096 src/app.js
```

### Log Analysis

#### Error Investigation
```bash
# Search for errors in logs
grep -i error logs/cats.log

# Search for security events
grep -i security logs/security.log

# Monitor real-time logs
tail -f logs/cats.log | grep -i error
```

## 📞 Support

### Getting Help

1. **Documentation**: Check README.md and API documentation
2. **Logs**: Review application and error logs
3. **Health Check**: Verify `/health` endpoint
4. **Database**: Check database connectivity and migrations
5. **Environment**: Verify all environment variables are set

### Maintenance

#### Regular Maintenance Tasks

- [ ] Update dependencies monthly
- [ ] Rotate JWT secrets quarterly
- [ ] Review and rotate database passwords
- [ ] Clean up old log files
- [ ] Monitor disk space usage
- [ ] Review security audit logs
- [ ] Update SSL certificates before expiry

---

**Last Updated**: $(date)
**Version**: 1.0.0