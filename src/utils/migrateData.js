import sql from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

// Sample localStorage data structure for migration
const sampleLocalStorageData = {
  contacts: [
    {
      id: 'contact-1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      website: 'https://johndoe.com',
      status: 'active',
      tags: ['vip', 'customer'],
      businessName: 'John Doe Consulting',
      notes: 'Premium customer',
      lastRequest: '2024-01-15T10:30:00Z',
      reviewStatus: 'none',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'contact-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(555) 987-6543',
      website: 'https://janesmith.com',
      status: 'active',
      tags: ['prospect'],
      businessName: 'Jane Smith Design',
      notes: 'Interested in our services',
      lastRequest: null,
      reviewStatus: 'none',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    }
  ],
  campaigns: [
    {
      id: 'campaign-1',
      name: 'Q1 Review Campaign',
      description: 'Collecting reviews for Q1 performance',
      status: 'active',
      enrollments: 25,
      completionRate: 0.68,
      businessName: 'ReviewCraft Demo',
      targetPlatforms: ['google', 'yelp'],
      emailTemplate: 'Thank you for choosing us!',
      subjectLine: 'We value your feedback',
      selectedContacts: ['contact-1', 'contact-2'],
      steps: [
        {
          id: 'step-1',
          type: 'email',
          title: 'Send Review Request',
          description: 'Send personalized review request',
          icon: 'mail',
          order: 1,
          settings: {
            emailTemplate: 'Thank you for choosing us!',
            subjectLine: 'We value your feedback'
          }
        }
      ],
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    }
  ],
  userPreferences: {
    businessName: 'ReviewCraft Demo',
    businessType: 'SaaS',
    reviewPlatforms: ['google', 'yelp', 'facebook'],
    timezone: 'UTC',
    language: 'en',
    notifications: {
      email: true,
      browser: true
    }
  },
  reviewPlatformUrls: {
    google: 'https://g.page/reviewcraft-demo',
    yelp: 'https://www.yelp.com/biz/reviewcraft-demo',
    facebook: 'https://www.facebook.com/reviewcraft-demo',
    tripadvisor: 'https://www.tripadvisor.com/reviewcraft-demo',
    trustpilot: 'https://www.trustpilot.com/review/reviewcraft-demo'
  }
};

// Migrate contacts data
export const migrateContacts = async (userId, contacts) => {
  try {
    console.log(`🔄 Migrating ${contacts.length} contacts for user ${userId}...`);
    
    for (const contact of contacts) {
      await sql`
        INSERT INTO contacts (
          id, user_id, name, email, phone, website, status, tags,
          business_name, notes, last_request, review_status,
          created_at, updated_at
        ) VALUES (
          ${contact.id}, ${userId}, ${contact.name}, ${contact.email},
          ${contact.phone}, ${contact.website}, ${contact.status}, ${contact.tags},
          ${contact.businessName}, ${contact.notes}, ${contact.lastRequest},
          ${contact.reviewStatus}, ${contact.createdAt}, ${contact.updatedAt}
        ) ON CONFLICT (id) DO NOTHING
      `;
    }
    
    console.log(`✅ Successfully migrated ${contacts.length} contacts`);
    return true;
  } catch (error) {
    console.error('❌ Error migrating contacts:', error);
    return false;
  }
};

// Migrate campaigns data
export const migrateCampaigns = async (userId, campaigns) => {
  try {
    console.log(`🔄 Migrating ${campaigns.length} campaigns for user ${userId}...`);
    
    for (const campaign of campaigns) {
      await sql`
        INSERT INTO campaigns (
          id, user_id, name, description, status, enrollments,
          completion_rate, business_name, target_platforms,
          email_template, subject_line, selected_contacts,
          steps, created_at, updated_at
        ) VALUES (
          ${campaign.id}, ${userId}, ${campaign.name}, ${campaign.description},
          ${campaign.status}, ${campaign.enrollments}, ${campaign.completionRate},
          ${campaign.businessName}, ${campaign.targetPlatforms},
          ${campaign.emailTemplate}, ${campaign.subjectLine}, ${campaign.selectedContacts},
          ${JSON.stringify(campaign.steps)}, ${campaign.createdAt}, ${campaign.updatedAt}
        ) ON CONFLICT (id) DO NOTHING
      `;
    }
    
    console.log(`✅ Successfully migrated ${campaigns.length} campaigns`);
    return true;
  } catch (error) {
    console.error('❌ Error migrating campaigns:', error);
    return false;
  }
};

// Migrate user preferences
export const migrateUserPreferences = async (userId, preferences) => {
  try {
    console.log(`🔄 Migrating user preferences for user ${userId}...`);
    
    await sql`
      INSERT INTO user_preferences (
        user_id, business_name, business_type, review_platforms,
        timezone, language, notifications, created_at, updated_at
      ) VALUES (
        ${userId}, ${preferences.businessName}, ${preferences.businessType},
        ${preferences.reviewPlatforms}, ${preferences.timezone}, ${preferences.language},
        ${JSON.stringify(preferences.notifications)}, NOW(), NOW()
      ) ON CONFLICT (user_id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        business_type = EXCLUDED.business_type,
        review_platforms = EXCLUDED.review_platforms,
        timezone = EXCLUDED.timezone,
        language = EXCLUDED.language,
        notifications = EXCLUDED.notifications,
        updated_at = NOW()
    `;
    
    console.log(`✅ Successfully migrated user preferences`);
    return true;
  } catch (error) {
    console.error('❌ Error migrating user preferences:', error);
    return false;
  }
};

// Migrate review platform URLs
export const migrateReviewPlatformUrls = async (userId, urls) => {
  try {
    console.log(`🔄 Migrating review platform URLs for user ${userId}...`);
    
    await sql`
      INSERT INTO review_platform_urls (
        user_id, google, yelp, facebook, tripadvisor, trustpilot,
        created_at, updated_at
      ) VALUES (
        ${userId}, ${urls.google}, ${urls.yelp}, ${urls.facebook},
        ${urls.tripadvisor}, ${urls.trustpilot}, NOW(), NOW()
      ) ON CONFLICT (user_id) DO UPDATE SET
        google = EXCLUDED.google,
        yelp = EXCLUDED.yelp,
        facebook = EXCLUDED.facebook,
        tripadvisor = EXCLUDED.tripadvisor,
        trustpilot = EXCLUDED.trustpilot,
        updated_at = NOW()
    `;
    
    console.log(`✅ Successfully migrated review platform URLs`);
    return true;
  } catch (error) {
    console.error('❌ Error migrating review platform URLs:', error);
    return false;
  }
};

// Main migration function
export const migrateLocalStorageData = async (userId, localStorageData = sampleLocalStorageData) => {
  try {
    console.log(`🚀 Starting data migration for user ${userId}...`);
    
    // Create user record if it doesn't exist
    await sql`
      INSERT INTO users (id, email, created_at, updated_at)
      VALUES (${userId}, ${`user-${userId}@example.com`}, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    
    // Migrate all data types
    const contactsSuccess = await migrateContacts(userId, localStorageData.contacts || []);
    const campaignsSuccess = await migrateCampaigns(userId, localStorageData.campaigns || []);
    const preferencesSuccess = await migrateUserPreferences(userId, localStorageData.userPreferences || {});
    const urlsSuccess = await migrateReviewPlatformUrls(userId, localStorageData.reviewPlatformUrls || {});
    
    if (contactsSuccess && campaignsSuccess && preferencesSuccess && urlsSuccess) {
      console.log(`✅ Data migration completed successfully for user ${userId}`);
      return true;
    } else {
      console.error(`❌ Data migration failed for user ${userId}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during data migration:', error);
    return false;
  }
};

// Export sample data for testing
export { sampleLocalStorageData }; 