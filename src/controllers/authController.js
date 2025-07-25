import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT token
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// User registration
export const registerUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password too weak',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, email FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const userId = uuidv4();
    const newUser = await sql`
      INSERT INTO users (id, email, password_hash, first_name, last_name, business_name)
      VALUES (${userId}, ${email}, ${passwordHash}, ${firstName || null}, ${lastName || null}, ${businessName || null})
      RETURNING id, email, first_name, last_name, business_name, created_at
    `;

    if (newUser.length === 0) {
      return res.status(500).json({
        error: 'Registration failed',
        message: 'Failed to create user account'
      });
    }

    const user = newUser[0];

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        businessName: user.business_name,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

// User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const users = await sql`
      SELECT id, email, password_hash, first_name, last_name, business_name, is_active
      FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    await sql`
      UPDATE users SET last_login = NOW() WHERE id = ${user.id}
    `;

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        businessName: user.business_name
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

// Check email availability
export const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        message: 'Email parameter is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({
        available: false,
        message: 'Invalid email format'
      });
    }

    // Check if email exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    const isAvailable = existingUser.length === 0;

    res.json({
      available: isAvailable,
      message: isAvailable 
        ? 'Email is available' 
        : 'Email already registered'
    });

  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({
      error: 'Email check failed',
      message: 'An error occurred while checking email availability'
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const users = await sql`
      SELECT id, email, first_name, last_name, business_name, created_at, last_login
      FROM users WHERE id = ${userId} AND is_active = true
    `;

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account not found or disabled'
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        businessName: user.business_name,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user profile',
      message: 'An error occurred while fetching user profile'
    });
  }
}; 