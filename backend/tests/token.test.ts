import request from 'supertest';
import app from '../src/app';
import { Token } from '../src/models/Token';

describe('Hospital Token / OPD Queue System API Endpoints', () => {
  let patientToken: string;
  let otherPatientToken: string;
  let staffToken: string;
  let adminToken: string;

  let validHospitalId: string;
  let validDoctorId: string;
  let patientTokenId: string;

  beforeAll(async () => {
    // Clear tokens for a clean test state
    await Token.deleteMany({});

    // 1. Register & Login Patient 1
    const p1Email = `token_p1_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p1Email,
      password: 'Password123!',
      name: 'Token Patient One',
    });
    const p1Login = await request(app).post('/api/v1/auth/login').send({
      email: p1Email,
      password: 'Password123!',
    });
    patientToken = p1Login.body.data.accessToken;

    // 2. Register & Login Patient 2
    const p2Email = `token_p2_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p2Email,
      password: 'Password123!',
      name: 'Token Patient Two',
    });
    const p2Login = await request(app).post('/api/v1/auth/login').send({
      email: p2Email,
      password: 'Password123!',
    });
    otherPatientToken = p2Login.body.data.accessToken;

    // 3. Login Staff & Admin
    const staffLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'staff.gondal@healthcare.gov.in',
      password: 'Password123!',
    });
    staffToken = staffLogin.body.data.accessToken;

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@healthcare.gov.in',
      password: 'Password123!',
    });
    adminToken = adminLogin.body.data.accessToken;

    // Fetch hospital & doctor IDs
    const hospRes = await request(app).get('/api/v1/hospitals');
    validHospitalId = hospRes.body.data.hospitals[0].id;

    const docRes = await request(app)
      .get('/api/v1/doctors')
      .query({ hospitalId: validHospitalId, availabilityStatus: 'AVAILABLE' });
    validDoctorId = docRes.body.data.doctors[0].id;
  });

  it('POST /api/v1/tokens - Patient 1 should successfully get token #1', async () => {
    const res = await request(app)
      .post('/api/v1/tokens')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        hospitalId: validHospitalId,
        doctorId: validDoctorId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.token.tokenNumber).toBe(1);
    expect(res.body.data.token.status).toBe('WAITING');

    patientTokenId = res.body.data.token.id;
  });

  it('POST /api/v1/tokens - Patient 1 should NOT be allowed multiple active tokens for same doctor today', async () => {
    const res = await request(app)
      .post('/api/v1/tokens')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        hospitalId: validHospitalId,
        doctorId: validDoctorId,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TOKEN_ALREADY_EXISTS');
  });

  it('POST /api/v1/tokens - Patient 2 should receive sequential token #2', async () => {
    const res = await request(app)
      .post('/api/v1/tokens')
      .set('Authorization', `Bearer ${otherPatientToken}`)
      .send({
        hospitalId: validHospitalId,
        doctorId: validDoctorId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token.tokenNumber).toBe(2);
    expect(res.body.data.token.status).toBe('WAITING');
  });

  it('GET /api/v1/tokens/my - Patient should view their token history', async () => {
    const res = await request(app)
      .get('/api/v1/tokens/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.length).toBe(1);
    expect(res.body.data.tokens[0].tokenNumber).toBe(1);
  });

  it('GET /api/v1/tokens/:tokenId - Patient 1 should view their token and queue calculation', async () => {
    const res = await request(app)
      .get(`/api/v1/tokens/${patientTokenId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token.tokenNumber).toBe(1);
    expect(res.body.data.queueMetrics.position).toBe(1);
    expect(res.body.data.queueMetrics.patientsBefore).toBe(0);
  });

  it('GET /api/v1/hospitals/:hospitalId/doctors/:doctorId/queue - Public/Staff queue query', async () => {
    const res = await request(app).get(
      `/api/v1/tokens/hospitals/${validHospitalId}/doctors/${validDoctorId}/queue`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.queue.totalTokensIssued).toBe(2);
    expect(res.body.data.queue.waitingPatientsCount).toBe(2);
  });

  it('PATCH /api/v1/tokens/hospitals/:hospitalId/doctors/:doctorId/queue/next - Staff calls next patient (Token #1)', async () => {
    const res = await request(app)
      .patch(`/api/v1/tokens/hospitals/${validHospitalId}/doctors/${validDoctorId}/queue/next`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token.tokenNumber).toBe(1);
    expect(res.body.data.token.status).toBe('CALLED');
  });

  it('PATCH /api/v1/tokens/:tokenId/status - Staff updates token to IN_PROGRESS & COMPLETED', async () => {
    // 1. CALLED -> IN_PROGRESS
    const res1 = await request(app)
      .patch(`/api/v1/tokens/${patientTokenId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'IN_PROGRESS' });

    expect(res1.status).toBe(200);
    expect(res1.body.data.token.status).toBe('IN_PROGRESS');

    // 2. IN_PROGRESS -> COMPLETED
    const res2 = await request(app)
      .patch(`/api/v1/tokens/${patientTokenId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'COMPLETED' });

    expect(res2.status).toBe(200);
    expect(res2.body.data.token.status).toBe('COMPLETED');
  });
});
