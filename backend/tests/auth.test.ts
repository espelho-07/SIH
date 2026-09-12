import request from 'supertest';
import app from '../src/app';

describe('Auth API Endpoints', () => {
  const testUser = {
    email: `testuser_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test Patient User',
  };

  it('POST /api/v1/auth/register - should register a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('POST /api/v1/auth/login - should authenticate existing user and return JWT tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('POST /api/v1/auth/login - should fail with invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
