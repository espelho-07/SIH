import mongoose from 'mongoose';
import { env } from '../src/config/env';

jest.setTimeout(30000); // 30s timeout for cloud database queries

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(env.DATABASE_URL);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
