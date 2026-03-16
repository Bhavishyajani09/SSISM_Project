const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const users = [
      { email: 'sourabhk.bca2024@ssism.org', password: hashedPassword },
      { email: 'bhavishyaj.bca2024@ssism.org', password: hashedPassword }
    ];

    for (const userData of users) {
      const userExists = await User.findOne({ email: userData.email });
      if (!userExists) {
        await User.create(userData);
        console.log(`User created: ${userData.email}`);
      } else {
        // Update password for existing users to ensure we know it
        userExists.password = hashedPassword;
        await userExists.save();
        console.log(`User updated with password: ${userData.email}`);
      }
    }

    console.log('Seeding completed! Default password is: password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedUsers();
