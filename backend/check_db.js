const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/HP/OneDrive/Desktop/SSISM/SSISM_Project/backend/.env' });
const HomeVerification = require('./models/HomeVerification');

const checkLastRecord = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'ssism' });
    const last = await HomeVerification.findOne().sort({ updatedAt: -1 });
    if (!last) {
      console.log('No records found.');
    } else {
      console.log('--- RELEVANT FIELDS ---');
      console.log('Student ID:', last.studentId);
      console.log('Irrigation Source:', last.irrigationSource);
      console.log('Land Type:', last.landType);
      console.log('Land Ownership:', last.landOwnership);
      console.log('-----------------------');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkLastRecord();
