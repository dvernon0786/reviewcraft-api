import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify JWT token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ 
          error: 'Invalid token',
          message: 'Your authentication token is invalid or expired'
        });
      }
      req.user = decoded;
      req.userId = decoded.userId; // Our JWT contains userId
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
};

// Middleware to extract user ID from token
export const extractUserId = (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        error: 'User ID not found',
        message: 'Unable to identify user from token'
      });
    }
    
    req.userId = req.user.userId; // Our JWT contains userId
    next();
  } catch (error) {
    console.error('User ID extraction error:', error);
    return res.status(500).json({ 
      error: 'User identification failed',
      message: 'An error occurred while identifying the user'
    });
  }
};

// Combined middleware for protected routes
export const requireAuth = [authenticateToken, extractUserId];

// Optional authentication for demo mode
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err && decoded) {
          req.user = decoded;
          req.userId = decoded.userId;
        }
      });
    }
    next();
  } catch (error) {
    // Continue without authentication for demo mode
    next();
  }
}; 