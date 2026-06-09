import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';
import { env } from '../config/env';

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('ℹ️  Admin already exists, skipping seed');
      process.exit(0);
    }

    const passwordHash = await hashPassword('admin123');
    await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
      spPoints: 0,
    });

    console.log('✅ Admin user created:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
