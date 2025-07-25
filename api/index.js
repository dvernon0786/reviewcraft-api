import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple API test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }
    
    // For testing, accept any valid email/password
    if (email && password) {
      res.json({
        success: true,
        message: 'Login successful (test mode)',
        user: {
          id: 'test-user-id',
          email: email,
          firstName: 'Test',
          lastName: 'User'
        },
        token: 'test-token-123'
      });
    } else {
      res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  });
});

// Contact endpoints
app.get('/api/contacts', (req, res) => {
  res.json([]);
});

app.post('/api/contacts', (req, res) => {
  res.json({ id: 'new-contact-id', ...req.body });
});

// Campaign endpoints
app.get('/api/campaigns', (req, res) => {
  res.json([]);
});

app.post('/api/campaigns', (req, res) => {
  res.json({ id: 'new-campaign-id', ...req.body });
});

// Email template endpoints
app.get('/api/email-templates', (req, res) => {
  res.json([]);
});

app.post('/api/email-templates', (req, res) => {
  res.json({ id: 'new-template-id', ...req.body });
});

// Email log endpoints
app.get('/api/email-logs', (req, res) => {
  res.json([]);
});

app.post('/api/email-logs', (req, res) => {
  res.json({ id: 'new-log-id', ...req.body });
});

// User preferences endpoints
app.get('/api/user-preferences', (req, res) => {
  res.json({
    emailSettings: {},
    notificationSettings: {},
    theme: 'light'
  });
});

app.put('/api/user-preferences', (req, res) => {
  res.json(req.body);
});

// Review platform URLs endpoints
app.get('/api/review-platform-urls', (req, res) => {
  res.json({
    google: '',
    yelp: '',
    facebook: '',
    tripadvisor: ''
  });
});

app.put('/api/review-platform-urls', (req, res) => {
  res.json(req.body);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'A server error has occurred',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
