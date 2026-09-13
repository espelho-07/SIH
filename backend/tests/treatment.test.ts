import request from 'supertest';
import app from '../src/app';

describe('Nearest Treatment-wise Hospital Search API Endpoints', () => {
  it('GET /api/v1/hospitals/nearby/treatment - should return hospitals providing Orthopedic treatment sorted by distance', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/nearby/treatment')
      .query({
        latitude: 22.3039,
        longitude: 70.8022,
        treatment: 'Orthopedic',
        radius: 50,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.hospitals)).toBe(true);
    expect(res.body.data.hospitals.length).toBeGreaterThan(0);

    const firstHosp = res.body.data.hospitals[0];
    expect(firstHosp).toHaveProperty('distanceKm');
    expect(firstHosp).toHaveProperty('treatment', 'Orthopedic');
    expect(firstHosp).toHaveProperty('location');
  });

  it('GET /api/v1/hospitals/nearby/treatment - should return empty list for non-existent treatment', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/nearby/treatment')
      .query({
        latitude: 22.3039,
        longitude: 70.8022,
        treatment: 'NonExistentSpecialty123',
        radius: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hospitals).toHaveLength(0);
  });

  it('GET /api/v1/hospitals/nearby/treatment - should fail validation when treatment query parameter is missing', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/nearby/treatment')
      .query({
        latitude: 22.3039,
        longitude: 70.8022,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
