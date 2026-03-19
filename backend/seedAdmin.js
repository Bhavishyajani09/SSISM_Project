const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'ssism',
    });
    console.log('MongoDB connected for admin seeding...');

    const adminEmail = 'admin@ssism.org';
    const adminPassword = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminUser = {
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    };

    const userExists = await User.findOne({ email: adminEmail });
    if (!userExists) {
      await User.create(adminUser);
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      userExists.password = hashedPassword;
      userExists.role = 'admin';
      await userExists.save();
      console.log(`Admin user updated: ${adminEmail}`);
    }

    console.log('Admin seeding completed! Password is: ' + adminPassword);
    process.exit(0);
  } catch (err) {
    console.error('Admin seeding error:', err);
    process.exit(1);
  }
};

seedAdmin();
