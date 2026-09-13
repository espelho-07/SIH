import request from 'supertest';
import app from '../src/app';

describe('Hospital & Facility Geolocation API Endpoints', () => {
  let adminToken: string;
  let createdHospitalId: string;

  beforeAll(async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@healthcare.gov.in',
      password: 'Password123!',
    });
    adminToken = loginRes.body.data.accessToken;
  });

  it('GET /api/v1/hospitals - should fetch list of hospitals', async () => {
    const res = await request(app).get('/api/v1/hospitals');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.hospitals)).toBe(true);
    expect(res.body.data.hospitals.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/hospitals - admin should create a new hospital', async () => {
    const newHospital = {
      name: 'Test Referral Hospital',
      type: 'CHC',
      address: 'Near Central Station',
      district: 'Rajkot',
      state: 'Gujarat',
      pincode: '360001',
      latitude: 22.3000,
      longitude: 70.8000,
      phone: '+91 281 9999999',
      openingTime: '08:00 AM',
      closingTime: '08:00 PM',
      emergencyAvailable: true,
    };

    const res = await request(app)
      .post('/api/v1/hospitals')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newHospital);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hospital.name).toBe(newHospital.name);
    createdHospitalId = res.body.data.hospital.id || res.body.data.hospital._id;
  });

  it('PUT /api/v1/hospitals/:hospitalId - admin should update an existing hospital', async () => {
    const updateData = {
      name: 'Updated Test Referral Hospital',
      phone: '+91 281 8888888',
    };

    const res = await request(app)
      .put(`/api/v1/hospitals/${createdHospitalId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hospital.name).toBe(updateData.name);
  });

  it('DELETE /api/v1/hospitals/:hospitalId - admin should delete a hospital', async () => {
    const res = await request(app)
      .delete(`/api/v1/hospitals/${createdHospitalId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/hospitals/nearby - should return hospitals sorted by distance', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/nearby')
      .query({ latitude: 22.3039, longitude: 70.8022, radius: 25 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.hospitals)).toBe(true);

    if (res.body.data.hospitals.length >= 2) {
      const dist1 = res.body.data.hospitals[0].distanceKm;
      const dist2 = res.body.data.hospitals[1].distanceKm;
      expect(dist1).toBeLessThanOrEqual(dist2);
    }
  });

  it('GET /api/v1/facilities/nearest - should return nearest medical facility offering specified service', async () => {
    const res = await request(app)
      .get('/api/v1/facilities/nearest')
      .query({ latitude: 22.3039, longitude: 70.8022, service: 'Gynecology' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.found).toBe(true);
    expect(res.body.data.nearestFacility).toBeDefined();
    expect(res.body.data.nearestFacility.matchedServices).toContain('Gynecology');
  });

  it('GET /api/v1/hospitals/nearby - should validate coordinate bounds', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/nearby')
      .query({ latitude: 122.3039, longitude: 70.8022 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
