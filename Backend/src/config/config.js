// Application Configuration
const config = {
  // Server Configuration
  server: {
    port: process.env.PORT,
    host: process.env.HOST,
    env: process.env.NODE_ENV
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  },

  // API Base URLs
  api: {
    baseUrl: process.env.API_BASE_URL,
    frontendUrl: process.env.FRONTEND_URL
  }
};

module.exports = config;
