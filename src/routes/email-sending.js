import express from 'express';
import { Resend } from 'resend';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Initialize Resend with API key (store this in environment variables in production)
const resend = new Resend('re_JCUfqAGz_31eDBCQ4hSFxbJYfCeai4JTj');

// Send review request email
router.post('/send-review-request', authenticateToken, async (req, res) => {
  try {
    const {
      contactName,
      contactEmail,
      businessName,
      reviewPlatformUrls,
      selectedPlatforms
    } = req.body;

    // Validate required fields
    if (!contactEmail || !contactName || !businessName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Contact email, name, and business name are required'
      });
    }

    // Generate platform links
    const platformLinks = generatePlatformLinks(reviewPlatformUrls, selectedPlatforms);
    
    // Create email HTML content
    const htmlContent = createReviewRequestEmail({
      contactName,
      businessName,
      platformLinks
    });

    const emailData = {
      to: contactEmail,
      subject: `We'd love your feedback, ${contactName}!`,
      html: htmlContent,
      text: `Hi ${contactName},\n\nThank you for choosing ${businessName}! We hope you had a great experience.\n\nWe'd really appreciate your feedback. Your review helps us improve our service and helps other customers make informed decisions.\n\nIt only takes a minute, and it means a lot to us!\n\nThank you for your time!\nBest regards,\nThe ${businessName} Team`,
      from: 'onboarding@resend.dev'
    };

    const result = await resend.emails.send(emailData);
    
    if (result.error) {
      console.error('Failed to send email:', result.error);
      return res.status(500).json({
        error: 'Failed to send email',
        message: 'An error occurred while sending the email'
      });
    }

    console.log('Email sent successfully:', result.data);
    res.json({
      success: true,
      message: 'Email sent successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      error: 'Email sending failed',
      message: 'An error occurred while sending the email'
    });
  }
});

// Send test email
router.post('/send-test-email', authenticateToken, async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        error: 'Missing email address',
        message: 'Email address is required'
      });
    }

    const emailData = {
      to,
      subject: 'Test Email from ReviewCraft',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email from ReviewCraft</h2>
          <p>This is a test email to verify that your email service is working correctly.</p>
          <p>If you received this email, your email configuration is working properly!</p>
          <hr>
          <p style="color: #6b7280; font-size: 12px;">
            Sent from ReviewCraft - Your Review Management Platform
          </p>
        </div>
      `,
      text: 'This is a test email from ReviewCraft to verify your email service is working correctly.',
      from: 'onboarding@resend.dev'
    };

    const result = await resend.emails.send(emailData);
    
    if (result.error) {
      console.error('Failed to send test email:', result.error);
      return res.status(500).json({
        error: 'Failed to send test email',
        message: 'An error occurred while sending the test email'
      });
    }

    console.log('Test email sent successfully:', result.data);
    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: result.data
    });

  } catch (error) {
    console.error('Test email sending error:', error);
    res.status(500).json({
      error: 'Test email sending failed',
      message: 'An error occurred while sending the test email'
    });
  }
});

// Helper function to generate platform links
function generatePlatformLinks(reviewPlatformUrls, selectedPlatforms) {
  const platformConfigs = {
    google: {
      name: 'Google Reviews',
      icon: '🔍',
      url: reviewPlatformUrls.google
    },
    yelp: {
      name: 'Yelp',
      icon: '⭐',
      url: reviewPlatformUrls.yelp
    },
    facebook: {
      name: 'Facebook',
      icon: '📘',
      url: reviewPlatformUrls.facebook
    },
    tripadvisor: {
      name: 'TripAdvisor',
      icon: '🗺️',
      url: reviewPlatformUrls.tripadvisor
    },
    trustpilot: {
      name: 'Trustpilot',
      icon: '🤝',
      url: reviewPlatformUrls.trustpilot
    }
  };

  let linksHtml = '';
  
  selectedPlatforms.forEach(platform => {
    const config = platformConfigs[platform];
    if (config && config.url) {
      linksHtml += `
        <a href="${config.url}" 
           style="display: inline-block; margin: 8px; padding: 12px 20px; 
                  background-color: #2563eb; color: white; text-decoration: none; 
                  border-radius: 6px; font-weight: 500;">
          ${config.icon} ${config.name}
        </a>
      `;
    }
  });

  return linksHtml;
}

// Helper function to create review request email HTML
function createReviewRequestEmail(data) {
  const { contactName, businessName, platformLinks } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">⭐</h1>
        <h2 style="color: #1f2937; margin: 10px 0;">We'd love your feedback!</h2>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
          Hi ${contactName},
        </p>
        
        <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
          Thank you for choosing <strong>${businessName}</strong>! We hope you had a great experience with us.
        </p>
        
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
          We'd really appreciate your feedback. Your review helps us improve our service and helps other customers make informed decisions.
        </p>
        
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">
          It only takes a minute, and it means a lot to us!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <h3 style="color: #1f2937; margin-bottom: 15px;">Leave us a review:</h3>
        ${platformLinks}
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #374151; font-size: 14px;">
          Thank you for your time and for choosing ${businessName}!
        </p>
        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          The ${businessName} Team
        </p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="text-align: center; color: #6b7280; font-size: 12px;">
        Sent from ReviewCraft - Your Review Management Platform
      </p>
    </div>
  `;
}

export default router; 