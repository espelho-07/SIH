import request from 'supertest';
import app from '../src/app';

describe('Medicine Catalog & Location Availability API Endpoints', () => {
  let sampleMedicineId: string;

  it('GET /api/v1/medicines - should search and retrieve medicine master records', async () => {
    const res = await request(app)
      .get('/api/v1/medicines')
      .query({ search: 'Paracetamol' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.medicines.length).toBeGreaterThan(0);
    sampleMedicineId = res.body.data.medicines[0].id;
  });

  it('GET /api/v1/medicines/:medicineId/availability - should find nearby hospitals stocking medicine with quantity & timestamp', async () => {
    expect(sampleMedicineId).toBeDefined();

    const res = await request(app)
      .get(`/api/v1/medicines/${sampleMedicineId}/availability`)
      .query({ latitude: 22.3039, longitude: 70.8022, radius: 30 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.medicine.name).toBeDefined();
    expect(Array.isArray(res.body.data.facilities)).toBe(true);

    if (res.body.data.facilities.length > 0) {
      const facility = res.body.data.facilities[0];
      expect(facility).toHaveProperty('hospitalName');
      expect(facility).toHaveProperty('quantity');
      expect(facility).toHaveProperty('availabilityStatus');
      expect(facility).toHaveProperty('lastUpdated');
    }
  });
});
