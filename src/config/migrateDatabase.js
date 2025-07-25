import sql from './database.js';

// Migration script to update users table for authentication
export const migrateDatabase = async () => {
  try {
    console.log('🔄 Starting database migration...');

    // Check if password_hash column exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `;

    if (checkColumn.length === 0) {
      console.log('📝 Adding authentication columns to users table...');
      
      // Add new columns to users table
      await sql`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
        ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
        ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
        ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
      `;

      // Add unique constraint to email if it doesn't exist
      const uniqueConstraint = await sql`
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'users' AND constraint_type = 'UNIQUE' AND constraint_name LIKE '%email%'
      `;

      if (uniqueConstraint.length === 0) {
        console.log('🔒 Adding unique constraint to email...');
        await sql`
          ALTER TABLE users 
          ADD CONSTRAINT unique_user_email UNIQUE (email)
        `;
      }

      // Create index for email if it doesn't exist
      const emailIndex = await sql`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'users' AND indexname = 'idx_users_email'
      `;

      if (emailIndex.length === 0) {
        console.log('📊 Creating email index...');
        await sql`CREATE INDEX idx_users_email ON users(email)`;
      }

      console.log('✅ Database migration completed successfully');
    } else {
      console.log('✅ Database schema is already up to date');
    }

    return true;
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    return false;
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateDatabase().then(success => {
    if (success) {
      console.log('🎉 Migration completed successfully');
      process.exit(0);
    } else {
      console.log('💥 Migration failed');
      process.exit(1);
    }
  });
} 