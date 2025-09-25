# CATS Backend - Setup Scripts

This folder contains all the setup and initialization scripts for the CATS backend.

## 📁 Scripts Overview

### `setup.js` - **Main Setup Script**

The comprehensive setup script that runs the entire initialization process.

```bash
# Run complete setup
npm run setup

# Or run directly
node scripts/setup.js
```

**What it does:**

1. Tests database connection
2. Creates all necessary tables
3. Seeds initial data
4. Provides next steps

---

### `create-tables.js` - **Database Schema Creation**

Creates the basic database tables required for the system.

```bash
# Run table creation
npm run create-tables

# Or run directly
node scripts/create-tables.js
```

**Tables created:**

- `roles` - User roles (admin, officer, citizen)
- `permissions` - System permissions
- `users` - User accounts
- `complaint_types` - Types of complaints

---

### `seed-data.js` - **Initial Data Population**

Populates the database with essential initial data.

```bash
# Run data seeding
npm run seed-data

# Or run directly
node scripts/seed-data.js
```

**Data seeded:**

- Default roles (super_admin, admin, officer, citizen)
- Basic permissions (CRUD operations)
- Complaint types (cyber fraud, identity theft, etc.)
- Admin user account

---

### `setup-database.js` - **Database Connection Setup**

Alternative setup script for database initialization using Sequelize sync.

```bash
# Run database setup
npm run setup-db

# Or run directly
node scripts/setup-database.js
```

---

### `setup-neondb.sh` - **NeonDB Setup Guide**

Shell script that displays step-by-step instructions for setting up NeonDB.

```bash
# View NeonDB setup instructions
./scripts/setup-neondb.sh
```

---

## 🚀 Quick Start

For a fresh installation, run:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your NeonDB connection string

# 3. Run complete setup
node scripts/setup.js

# 4. Start the server
npm start
```

---

## 🔧 Individual Script Usage

### First Time Setup

```bash
node scripts/create-tables.js    # Create tables
node scripts/seed-data.js        # Add initial data
```

### Reset Database

```bash
# Drop and recreate tables (use with caution)
node scripts/setup-database.js
```

### Test Connection

```bash
npm run test-db
```

---

## 📋 Default Admin Credentials

After running the setup scripts, you can login with:

- **Email:** `admin@cybercrime.gov.in`
- **Password:** `admin123`

**⚠️ Important:** Change the default password in production!

---

## 🛠️ Troubleshooting

### Database Connection Issues

1. Verify your `.env` file has the correct `DATABASE_URL`
2. Check if NeonDB is accessible
3. Run `npm run test-db` to verify connection

### Permission Issues

```bash
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

### Dependencies

Make sure all npm packages are installed:

```bash
npm install
```

---

## 📄 Environment Variables Required

```env
# Database (NeonDB)
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# JWT Secrets
JWT_SECRET=your_secure_jwt_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# Server
PORT=3000
NODE_ENV=development
```
