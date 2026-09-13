import request from 'supertest';
import app from '../src/app';

describe('Emergency Blood Inventory API Endpoints', () => {
  let patientToken: string;
  let staffToken: string;
  let validHospitalId: string;

  beforeAll(async () => {
    // 1. Patient Login
    const p1Email = `blood_patient_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p1Email,
      password: 'Password123!',
      name: 'Blood Patient',
    });
    const p1Login = await request(app).post('/api/v1/auth/login').send({
      email: p1Email,
      password: 'Password123!',
    });
    patientToken = p1Login.body.data.accessToken;

    // 2. Staff Login
    const staffLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'staff.gondal@healthcare.gov.in',
      password: 'Password123!',
    });
    staffToken = staffLogin.body.data.accessToken;

    // Hospital ID
    const hospRes = await request(app).get('/api/v1/hospitals');
    validHospitalId = hospRes.body.data.hospitals[0].id;
  });

  it('GET /api/v1/emergency/blood - should return hospitals with B+ blood available sorted by distance', async () => {
    const res = await request(app)
      .get('/api/v1/emergency/blood')
      .query({
        bloodGroup: 'B+',
        latitude: 22.3039,
        longitude: 70.8022,
        radius: 50,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.hospitals)).toBe(true);
    expect(res.body.data.hospitals.length).toBeGreaterThan(0);

    const firstHosp = res.body.data.hospitals[0];
    expect(firstHosp.bloodGroup).toBe('B+');
    expect(firstHosp.availableUnits).toBeGreaterThan(0);
    expect(firstHosp).toHaveProperty('distanceKm');
    expect(firstHosp).toHaveProperty('lastUpdated');
  });

  it('GET /api/v1/emergency/blood - should reject invalid blood group string', async () => {
    const res = await request(app)
      .get('/api/v1/emergency/blood')
      .query({
        bloodGroup: 'INVALID_BLOOD',
        latitude: 22.3039,
        longitude: 70.8022,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/hospitals/:hospitalId/blood-inventory/:bloodGroup - Hospital Staff should update available units', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/${validHospitalId}/blood-inventory/B+`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        availableUnits: 8,
        status: 'AVAILABLE',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inventoryItem.availableUnits).toBe(8);
  });

  it('PATCH /api/v1/hospitals/:hospitalId/blood-inventory/:bloodGroup - should reject blood inventory update from regular patient user', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/${validHospitalId}/blood-inventory/B+`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        availableUnits: 20,
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
