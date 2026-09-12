import request from 'supertest';
import app from '../src/app';

describe('Common Healthcare Cost API Endpoints', () => {
  it('GET /api/v1/hospitals/treatment-cost - should retrieve estimated cost range for X-Ray treatment', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/treatment-cost')
      .query({ treatment: 'X-Ray' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.costs)).toBe(true);
    expect(res.body.data.costs.length).toBeGreaterThan(0);

    const costItem = res.body.data.costs[0];
    expect(costItem).toHaveProperty('treatment');
    expect(costItem).toHaveProperty('estimatedCost');
    expect(costItem).toHaveProperty('costRange');
    expect(costItem.costRange).toHaveProperty('min');
    expect(costItem.costRange).toHaveProperty('max');
    expect(costItem.costRange).toHaveProperty('currency', 'INR');
  });

  it('GET /api/v1/hospitals/treatment-cost - should integrate location coordinates to calculate distance alongside cost', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/treatment-cost')
      .query({
        treatment: 'X-Ray',
        latitude: 22.3039,
        longitude: 70.8022,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.costs.length).toBeGreaterThan(0);

    const firstItem = res.body.data.costs[0];
    expect(firstItem.distanceKm).not.toBeNull();
    expect(typeof firstItem.distanceKm).toBe('number');
  });

  it('GET /api/v1/hospitals/treatment-cost - should fail validation when treatment query is missing', async () => {
    const res = await request(app).get('/api/v1/hospitals/treatment-cost');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
