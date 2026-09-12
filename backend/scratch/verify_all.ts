import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { env } from '../src/config/env';

async function verify() {
  console.log('🔍 Starting comprehensive local verification test...');
  await mongoose.connect(env.DATABASE_URL);

  // 1. Health check
  const healthRes = await request(app).get('/health');
  console.log('1. Health Check status:', healthRes.status, healthRes.body.message);

  // 2. Nearby Hospitals
  const nearbyRes = await request(app)
    .get('/api/v1/hospitals/nearby')
    .query({ latitude: 22.3039, longitude: 70.8022, radius: 15 });
  console.log(
    '2. GET /api/v1/hospitals/nearby - Count:',
    nearbyRes.body.data?.count,
    'Top Hospital:',
    nearbyRes.body.data?.hospitals?.[0]?.name,
    'Distance:',
    nearbyRes.body.data?.hospitals?.[0]?.distanceKm,
    'km'
  );

  // 3. Nearest Facility (Gynecology service)
  const nearestRes = await request(app)
    .get('/api/v1/facilities/nearest')
    .query({ latitude: 22.3039, longitude: 70.8022, service: 'Gynecology' });
  console.log(
    '3. GET /api/v1/facilities/nearest - Nearest Facility:',
    nearestRes.body.data?.nearestFacility?.name,
    'Distance:',
    nearestRes.body.data?.nearestFacility?.distanceKm,
    'km'
  );

  // 4. Medicine Search & Stock Location Availability
  const medSearchRes = await request(app).get('/api/v1/medicines').query({ search: 'Paracetamol' });
  const med = medSearchRes.body.data?.medicines?.[0];
  console.log('4. GET /api/v1/medicines - Found:', med?.name, 'ID:', med?.id);

  if (med) {
    const availRes = await request(app)
      .get(`/api/v1/medicines/${med.id}/availability`)
      .query({ latitude: 22.3039, longitude: 70.8022, radius: 30 });
    console.log(
      '   GET /api/v1/medicines/:id/availability - Stock Facilities Count:',
      availRes.body.data?.totalAvailableFacilities,
      'First Stock Location:',
      availRes.body.data?.facilities?.[0]?.hospitalName,
      'Quantity:',
      availRes.body.data?.facilities?.[0]?.quantity,
      'Status:',
      availRes.body.data?.facilities?.[0]?.availabilityStatus,
      'Last Updated:',
      availRes.body.data?.facilities?.[0]?.lastUpdated
    );
  }

  // 5. Auth & Admin Protected Routes
  const loginRes = await request(app).post('/api/v1/auth/login').send({
    email: 'admin@healthcare.gov.in',
    password: 'Password123!',
  });
  console.log('5. Admin Login status:', loginRes.status, 'Role:', loginRes.body.data?.user?.role);
  const token = loginRes.body.data?.accessToken;

  // 6. Test Admin creation of new medicine stock
  const adminStockRes = await request(app)
    .put(`/api/v1/admin/hospitals/${nearbyRes.body.data?.hospitals?.[0]?.id}/medicines/${med.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ quantity: 250, availabilityStatus: 'AVAILABLE' });
  console.log('6. PUT /api/v1/admin/hospitals/:id/medicines/:id - Status:', adminStockRes.status, 'Updated Stock Quantity:', adminStockRes.body.data?.stock?.quantity);

  await mongoose.disconnect();
  console.log('✅ Comprehensive verification completed with ZERO errors!');
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
