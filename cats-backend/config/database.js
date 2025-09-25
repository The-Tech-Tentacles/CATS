const { Sequelize } = require("sequelize");
require("dotenv").config();

// Function to create database configuration
const createDbConfig = (env) => {
  // If DATABASE_URL is provided (like from NeonDB), use it
  if (process.env.DATABASE_URL) {
    return {
      use_env_variable: "DATABASE_URL",
      dialect: "postgres",
      logging: process.env.DB_LOGGING === "true" ? console.log : false,
      pool: {
        max: env === "production" ? 50 : 20,
        min: env === "production" ? 5 : 0,
        acquire: 60000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true, // Enable soft deletes
        freezeTableName: true,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
  }

  // Fallback to individual environment variables
  return {
    username: process.env.DB_USER || "cats_user",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "cats_db",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    pool: {
      max: env === "production" ? 50 : 20,
      min: env === "production" ? 5 : 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Enable soft deletes
      freezeTableName: true,
    },
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized:
                process.env.DB_SSL_REJECT_UNAUTHORIZED !== "true",
            }
          : false,
    },
  };
};

const config = {
  development: createDbConfig("development"),
  test: {
    ...createDbConfig("test"),
    database: (process.env.DB_NAME || "cats_db") + "_test",
    logging: false,
  },
  production: createDbConfig("production"),
};

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Create Sequelize instance
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL for NeonDB or other cloud providers
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
    pool: dbConfig.pool,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions,
  });
} else {
  // Use individual environment variables
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
  config,
};
