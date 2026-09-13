import request from 'supertest';
import app from '../src/app';

describe('Patient Appointment Booking System API Endpoints', () => {
  let patientToken: string;
  let otherPatientToken: string;
  let adminToken: string;

  let validHospitalId: string;
  let otherHospitalId: string;
  let validDoctorId: string;
  let bookedAppointmentId: string;

  const targetDate = '2026-10-15';

  beforeAll(async () => {
    // 1. Register & Login Patient 1
    const p1Email = `patient1_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p1Email,
      password: 'Password123!',
      name: 'Patient One',
    });
    const p1Login = await request(app).post('/api/v1/auth/login').send({
      email: p1Email,
      password: 'Password123!',
    });
    patientToken = p1Login.body.data.accessToken;

    // 2. Register & Login Patient 2
    const p2Email = `patient2_${Date.now()}@example.com`;
    await request(app).post('/api/v1/auth/register').send({
      email: p2Email,
      password: 'Password123!',
      name: 'Patient Two',
    });
    const p2Login = await request(app).post('/api/v1/auth/login').send({
      email: p2Email,
      password: 'Password123!',
    });
    otherPatientToken = p2Login.body.data.accessToken;

    // 3. Login Admin
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@healthcare.gov.in',
      password: 'Password123!',
    });
    adminToken = adminLogin.body.data.accessToken;

    // 4. Fetch real hospital & AVAILABLE doctor IDs from database
    const hospRes = await request(app).get('/api/v1/hospitals');
    const hospitals = hospRes.body.data.hospitals;
    validHospitalId = hospitals[0].id;
    otherHospitalId = hospitals[1].id;

    const docRes = await request(app)
      .get('/api/v1/doctors')
      .query({ hospitalId: validHospitalId, availabilityStatus: 'AVAILABLE' });
    validDoctorId = docRes.body.data.doctors[0].id;
  });

  it('GET /api/v1/doctors/:doctorId/slots - should fetch available doctor slots for a valid date', async () => {
    const res = await request(app)
      .get(`/api/v1/doctors/${validDoctorId}/slots`)
      .query({ date: targetDate });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slots).toBeDefined();
    expect(Array.isArray(res.body.data.slots)).toBe(true);
    expect(res.body.data.slots[0]).toHaveProperty('time');
    expect(res.body.data.slots[0].status).toBe('AVAILABLE');
  });

  it('POST /api/v1/appointments - should successfully book an appointment', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: validDoctorId,
        hospitalId: validHospitalId,
        appointmentDate: targetDate,
        timeSlot: '10:00',
        reason: 'Fever and general weakness consultation',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appointment).toBeDefined();
    expect(res.body.data.appointment.status).toBe('CONFIRMED');
    expect(res.body.data.appointment.timeSlot).toBe('10:00');

    bookedAppointmentId = res.body.data.appointment.id;
  });

  it('POST /api/v1/appointments - should prevent double booking for the same doctor, date & time slot', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${otherPatientToken}`)
      .send({
        doctorId: validDoctorId,
        hospitalId: validHospitalId,
        appointmentDate: targetDate,
        timeSlot: '10:00',
        reason: 'Duplicate slot booking attempt',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SLOT_ALREADY_BOOKED');
  });

  it('POST /api/v1/appointments - should reject when doctor does not belong to specified hospital', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: validDoctorId,
        hospitalId: otherHospitalId, // Mismatched hospital
        appointmentDate: targetDate,
        timeSlot: '11:00',
        reason: 'Mismatched doctor test',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('DOCTOR_NOT_IN_HOSPITAL');
  });

  it('POST /api/v1/appointments - should reject booking for a past date', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: validDoctorId,
        hospitalId: validHospitalId,
        appointmentDate: '2020-01-01', // Past date
        timeSlot: '10:30',
        reason: 'Past date test',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_APPOINTMENT_DATE');
  });

  it('POST /api/v1/appointments - should reject booking outside doctor consultation hours', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        doctorId: validDoctorId,
        hospitalId: validHospitalId,
        appointmentDate: targetDate,
        timeSlot: '03:00', // Outside working hours
        reason: 'Invalid time slot test',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_TIME_SLOT');
  });

  it('GET /api/v1/appointments/my - patient should be able to view their own booked appointments', async () => {
    const res = await request(app)
      .get('/api/v1/appointments/my')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.appointments)).toBe(true);
    expect(res.body.data.appointments.length).toBeGreaterThan(0);
    expect(res.body.data.appointments[0].id).toBe(bookedAppointmentId);
  });

  it('GET /api/v1/appointments/:appointmentId - patient should NOT be able to view another patient private appointment', async () => {
    const res = await request(app)
      .get(`/api/v1/appointments/${bookedAppointmentId}`)
      .set('Authorization', `Bearer ${otherPatientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED_APPOINTMENT_ACCESS');
  });

  it('PATCH /api/v1/appointments/:appointmentId/cancel - patient should cancel their booked appointment', async () => {
    const res = await request(app)
      .patch(`/api/v1/appointments/${bookedAppointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appointment.status).toBe('CANCELLED');
  });

  it('PATCH /api/v1/appointments/:appointmentId/cancel - should reject cancelling an already cancelled appointment', async () => {
    const res = await request(app)
      .patch(`/api/v1/appointments/${bookedAppointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('APPOINTMENT_ALREADY_CANCELLED');
  });

  it('POST /api/v1/appointments - should allow re-booking a slot after previous appointment was cancelled', async () => {
    const res = await request(app)
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${otherPatientToken}`)
      .send({
        doctorId: validDoctorId,
        hospitalId: validHospitalId,
        appointmentDate: targetDate,
        timeSlot: '10:00', // Same slot previously cancelled by Patient 1
        reason: 'Re-booking cancelled slot',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appointment.status).toBe('CONFIRMED');

    // Store for admin test
    bookedAppointmentId = res.body.data.appointment.id;
  });

  it('PATCH /api/v1/admin/appointments/:appointmentId/status - admin can update appointment status to COMPLETED', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/appointments/${bookedAppointmentId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appointment.status).toBe('COMPLETED');
  });
});
