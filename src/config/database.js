import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

// Test database connection
export const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create users table with basic structure first
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Run migration to add authentication fields
    const { migrateDatabase } = await import('./migrateDatabase.js');
    const migrationSuccess = await migrateDatabase();
    
    if (!migrationSuccess) {
      console.error('❌ Database migration failed');
      return false;
    }

    // Create contacts table
    await sql`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        phone VARCHAR,
        website VARCHAR,
        status VARCHAR DEFAULT 'active',
        tags TEXT[],
        business_name VARCHAR,
        notes TEXT,
        last_request TIMESTAMP,
        review_status VARCHAR DEFAULT 'none',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create campaigns table
    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        description TEXT,
        status VARCHAR DEFAULT 'draft',
        enrollments INTEGER DEFAULT 0,
        completion_rate DECIMAL DEFAULT 0,
        business_name VARCHAR,
        target_platforms TEXT[],
        email_template TEXT,
        subject_line VARCHAR,
        selected_contacts TEXT[],
        steps JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create email templates table
    await sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        subject VARCHAR NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        merge_tags TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create email logs table
    await sql`
      CREATE TABLE IF NOT EXISTS email_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        email_template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
        status VARCHAR NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        opened_at TIMESTAMP,
        clicked_at TIMESTAMP,
        bounce_reason TEXT,
        subject VARCHAR NOT NULL,
        content TEXT NOT NULL
      )
    `;

    // Create user preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR,
        business_type VARCHAR,
        review_platforms TEXT[],
        default_email_template UUID REFERENCES email_templates(id),
        email_signature TEXT,
        timezone VARCHAR DEFAULT 'UTC',
        language VARCHAR DEFAULT 'en',
        notifications JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create review platform URLs table
    await sql`
      CREATE TABLE IF NOT EXISTS review_platform_urls (
        user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        google VARCHAR,
        yelp VARCHAR,
        facebook VARCHAR,
        tripadvisor VARCHAR,
        trustpilot VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

export default sql; 