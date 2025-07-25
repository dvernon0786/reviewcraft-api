import express from 'express';
import { registerUser, loginUser, checkEmailAvailability, getCurrentUser } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// User registration
router.post('/register', registerUser);

// User login
router.post('/login', loginUser);

// Check email availability (for real-time validation)
router.get('/check-email', checkEmailAvailability);

// Get current user profile (protected route)
router.get('/me', authenticateToken, getCurrentUser);

export default router; 