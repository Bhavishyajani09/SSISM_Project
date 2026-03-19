const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('URI found:', !!uri);
    
    await mongoose.connect(uri);
    console.log('Connected to cluster.');
    
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name));
    
    // If 'test' exists, drop it
    if (dbs.databases.some(db => db.name === 'test')) {
      console.log('Dropping "test" database...');
      const testDb = mongoose.connection.useDb('test');
      await testDb.dropDatabase();
      console.log('✅ "test" database dropped.');
    } else {
      console.log('⚠️ "test" database not found.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testConnection();
