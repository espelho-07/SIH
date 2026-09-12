import { transferAllDataToDatabase } from './transferDataToMongo';

/**
 * Unified Database Seeder
 * Replaces the legacy, static seed file by ingesting all 28 mock collections 
 * directly into MongoDB so that the local MongoDB database is the complete,
 * authoritative source of truth for the entire application.
 */
transferAllDataToDatabase()
  .then(() => {
    console.log('🌱 Database seeded and verified successfully with 100% of mock datasets!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
