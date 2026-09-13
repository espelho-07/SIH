import request from 'supertest';
import app from '../src/app';

describe('Telecommunication Feature API Endpoints', () => {
  let patientToken: string;
  let unauthorizedPatientToken: string;
  let staffToken: string;

  let validHospitalId: string;
  let validDoctorId: string;
  let consultationId: string;

  beforeAll(async () => {
    // 1. Patient 1
    const p1Email = `tele_p1_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p1Email,
      password: 'Password123!',
      name: 'Tele Patient One',
    });
    const p1Login = await request(app).post('/api/v1/auth/login').send({
      email: p1Email,
      password: 'Password123!',
    });
    patientToken = p1Login.body.data.accessToken;

    // 2. Patient 2 (Unauthorized)
    const p2Email = `tele_p2_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p2Email,
      password: 'Password123!',
      name: 'Tele Patient Two',
    });
    const p2Login = await request(app).post('/api/v1/auth/login').send({
      email: p2Email,
      password: 'Password123!',
    });
    unauthorizedPatientToken = p2Login.body.data.accessToken;

    // 3. Staff
    const staffLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'staff.gondal@healthcare.gov.in',
      password: 'Password123!',
    });
    staffToken = staffLogin.body.data.accessToken;

    // Hospital & doctor
    const hospRes = await request(app).get('/api/v1/hospitals');
    validHospitalId = hospRes.body.data.hospitals[0].id;

    const docRes = await request(app)
      .get('/api/v1/doctors')
      .query({ hospitalId: validHospitalId, availabilityStatus: 'AVAILABLE' });
    validDoctorId = docRes.body.data.doctors[0].id;
  });

  it('POST /api/v1/teleconsultations - Patient requests teleconsultation', async () => {
    const res = await request(app)
      .post('/api/v1/teleconsultations')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: validDoctorId,
        hospitalId: validHospitalId,
        reason: 'Fever and throat pain teleconsultation request',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultation).toBeDefined();
    expect(res.body.data.consultation.status).toBe('REQUESTED');

    consultationId = res.body.data.consultation.id;
  });

  it('GET /api/v1/teleconsultations/my - Patient views teleconsultation history', async () => {
    const res = await request(app)
      .get('/api/v1/teleconsultations/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultations.length).toBeGreaterThan(0);
  });

  it('PATCH /api/v1/teleconsultations/:consultationId/accept - Staff accepts consultation', async () => {
    const res = await request(app)
      .patch(`/api/v1/teleconsultations/${consultationId}/accept`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultation.status).toBe('ACCEPTED');
  });

  it('PATCH /api/v1/teleconsultations/:consultationId/start - Staff starts active consultation session', async () => {
    const res = await request(app)
      .patch(`/api/v1/teleconsultations/${consultationId}/start`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultation.status).toBe('ACTIVE');
    expect(res.body.data.consultation.startedAt).toBeDefined();
  });

  it('POST /api/v1/teleconsultations/:consultationId/messages - Patient & Staff send chat messages', async () => {
    // Patient sends message
    const res1 = await request(app)
      .post(`/api/v1/teleconsultations/${consultationId}/messages`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ message: 'Hello doctor, I have fever since 2 days.' });

    expect(res1.status).toBe(201);
    expect(res1.body.data.message.message).toBe('Hello doctor, I have fever since 2 days.');

    // Staff sends reply
    const res2 = await request(app)
      .post(`/api/v1/teleconsultations/${consultationId}/messages`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ message: 'Please rest and take paracetamol 500mg after meals.' });

    expect(res2.status).toBe(201);
    expect(res2.body.data.message.message).toBe('Please rest and take paracetamol 500mg after meals.');
  });

  it('GET /api/v1/teleconsultations/:consultationId - Retrieve details & chat message history', async () => {
    const res = await request(app)
      .get(`/api/v1/teleconsultations/${consultationId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages.length).toBe(2);
  });

  it('GET /api/v1/teleconsultations/:consultationId - Reject access to unassociated patient', async () => {
    const res = await request(app)
      .get(`/api/v1/teleconsultations/${consultationId}`)
      .set('Authorization', `Bearer ${unauthorizedPatientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('TELECONSULTATION_NOT_AUTHORIZED');
  });

  it('PATCH /api/v1/teleconsultations/:consultationId/end - Staff ends active consultation', async () => {
    const res = await request(app)
      .patch(`/api/v1/teleconsultations/${consultationId}/end`)
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultation.status).toBe('COMPLETED');
    expect(res.body.data.consultation.endedAt).toBeDefined();
  });
});
