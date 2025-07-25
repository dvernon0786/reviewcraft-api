import express from 'express';

const router = express.Router();

// GET /api/user-preferences - Get user preferences
router.get('/', async (req, res) => {
  try {
    // For now, return default preferences
    res.json({
      businessName: '',
      businessType: '',
      reviewPlatforms: [],
      emailSettings: {
        defaultFrom: '',
        defaultSubject: '',
        signature: ''
      },
      notificationSettings: {
        emailNotifications: true,
        campaignAlerts: true
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user preferences',
      message: 'An error occurred while fetching user preferences'
    });
  }
});

// PUT /api/user-preferences - Update user preferences
router.put('/', async (req, res) => {
  try {
    const updateData = req.body;
    // For now, return the updated data
    const updatedPreferences = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    res.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ 
      error: 'Failed to update user preferences',
      message: 'An error occurred while updating user preferences'
    });
  }
});

export default router; 