import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { env } from '../src/config/env';

async function getAdminToken() {
  await mongoose.connect(env.DATABASE_URL);
  const res = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@healthcare.gov.in',
    password: 'Password123!',
  });
  console.log('STATUS:', res.status);
  console.log('ACCESS_TOKEN:', res.body.data?.accessToken);
  await mongoose.disconnect();
}

getAdminToken();
