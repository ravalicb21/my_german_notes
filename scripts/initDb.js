const dotenv = require('dotenv');
const database = require('../config/database');

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Connect to database
    await database.connect();
    
    console.log('Database initialized successfully!');
    
    // Close connection
    await database.close();
    
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;