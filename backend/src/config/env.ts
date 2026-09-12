import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().default('super_secret_jwt_access_key'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_jwt_refresh_key'),
  REDIS_URL: z.string().optional().default('redis://127.0.0.1:6379'),
  FRONTEND_URL: z.string().optional().default('http://localhost:3000'),
  MAPS_API_KEY: z.string().optional().default('mock_key'),
  GEMINI_API_KEY: z.string().optional().default('AIzaSyMockGeminiKeyForLocalDev'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment configuration:', _env.error.format());
  throw new Error('Invalid environment configuration');
}

export const env = _env.data;
