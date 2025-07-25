import express from 'express';

const router = express.Router();

// GET /api/review-platform-urls - Get review platform URLs
router.get('/', async (req, res) => {
  try {
    // For now, return default platform URLs
    res.json([
      {
        id: 'google',
        name: 'Google Reviews',
        url: 'https://www.google.com/search?q=',
        icon: '🔍',
        enabled: true
      },
      {
        id: 'yelp',
        name: 'Yelp',
        url: 'https://www.yelp.com/biz/',
        icon: '⭐',
        enabled: true
      },
      {
        id: 'facebook',
        name: 'Facebook',
        url: 'https://www.facebook.com/',
        icon: '📘',
        enabled: false
      },
      {
        id: 'tripadvisor',
        name: 'TripAdvisor',
        url: 'https://www.tripadvisor.com/',
        icon: '🏨',
        enabled: false
      }
    ]);
  } catch (error) {
    console.error('Error fetching review platform URLs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch review platform URLs',
      message: 'An error occurred while fetching review platform URLs'
    });
  }
});

// PUT /api/review-platform-urls - Update review platform URLs
router.put('/', async (req, res) => {
  try {
    const updateData = req.body;
    // For now, return the updated data
    const updatedPlatforms = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    res.json(updatedPlatforms);
  } catch (error) {
    console.error('Error updating review platform URLs:', error);
    res.status(500).json({ 
      error: 'Failed to update review platform URLs',
      message: 'An error occurred while updating review platform URLs'
    });
  }
});

export default router; 