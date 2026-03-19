const mongoose = require('mongoose');
require('dotenv').config();
const HomeVerification = require('./models/HomeVerification');

const checkLastRecord = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- DATABASE STATUS ---');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const coll of collections) {
        const count = await mongoose.connection.db.collection(coll.name).countDocuments();
        console.log(`- ${coll.name}: ${count} documents`);
    }
    console.log('-----------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkLastRecord();
