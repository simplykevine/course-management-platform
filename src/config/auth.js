const jwt = require("jsonwebtoken")
const logger = require("../utils/logger")

const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRE || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
    issuer: process.env.APP_NAME || "Course Management Platform Summative",
    audience: process.env.APP_URL || "http://localhost:3000",
  },

  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    saltRounds: 12,
  },

  // Session Configuration
  session: {
    maxConcurrentSessions: 5,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    rememberMeTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  // Rate Limiting
  rateLimiting: {
    loginAttempts: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDuration: 30 * 60 * 1000, // 30 minutes
    },
    passwordReset: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDuration: 2 * 60 * 60 * 1000, // 2 hours
    },
  },
}

// JWT Token Generation
const generateAccessToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.expiresIn,
    issuer: authConfig.jwt.issuer,
    audience: authConfig.jwt.audience,
  })
}

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, authConfig.jwt.refreshSecret, {
    expiresIn: authConfig.jwt.refreshExpiresIn,
    issuer: authConfig.jwt.issuer,
    audience: authConfig.jwt.audience,
  })
}

// JWT Token Verification
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.secret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    })
  } catch (error) {
    logger.error("Access token verification failed:", error)
    throw error
  }
}

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.refreshSecret, {
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    })
  } catch (error) {
    logger.error("Refresh token verification failed:", error)
    throw error
  }
}

// Token Blacklist (in production, use Redis)
const tokenBlacklist = new Set()

const blacklistToken = (token) => {
  tokenBlacklist.add(token)
}

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token)
}

module.exports = {
  authConfig,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
}
