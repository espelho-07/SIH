import { Request, Response } from 'express';
import { TokenModel, AppointmentModel, IToken } from '../models/Queue';
import { PatientModel } from '../models/Patient';
import { DoctorModel } from '../models/Doctor';
import { FacilityModel } from '../models/Facility';
import { sendSuccess, sendError } from '../utils/response';
import { broadcastTokenCalled, broadcastQueueUpdate } from '../sockets/socketHandler';

// Clerk Patient Search
export async function searchClerkPatients(req: Request, res: Response): Promise<void> {
  const params = { ...req.query, ...req.body };
  const search = params.search || '';

  const filter: any = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { abhaId: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const patients = await PatientModel.find(filter).sort({ registeredAt: -1 });
  sendSuccess(res, 'Patients retrieved successfully', patients.map((p) => p.toJSON()));
}

export async function getClerkPatientById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const patient = await PatientModel.findOne({ id });

  if (!patient) {
    sendError(res, `Patient ${id} not found`, 404);
    return;
  }

  sendSuccess(res, 'Patient details retrieved', patient.toJSON());
}

export async function checkDuplicatePatient(req: Request, res: Response): Promise<void> {
  const { phone, abhaId, name } = req.body;

  const filter: any = {};
  if (phone) filter.phone = phone;
  else if (abhaId) filter.abhaId = abhaId;
  else if (name) filter.name = { $regex: `^${name}$`, $options: 'i' };

  const existing = await PatientModel.findOne(filter);
  sendSuccess(res, 'Duplicate check completed', existing ? existing.toJSON() : null);
}

export async function registerPatient(req: Request, res: Response): Promise<void> {
  const data = req.body;
  const id = data.id || `usr_pat_${Date.now()}`;

  const patient = new PatientModel({
    ...data,
    id,
    registeredAt: new Date().toISOString(),
  });
  await patient.save();

  sendSuccess(res, 'Patient registered successfully', patient.toJSON(), 201);
}

// Appointments
export async function getAppointments(req: Request, res: Response): Promise<void> {
  const params = { ...req.query, ...req.body };
  const { patientId, status, date, facilityId, search } = params;

  const filter: any = {};
  if (patientId) {
    filter.$or = [
      { patientId },
      { patientPhone: patientId },
    ];
  }
  if (facilityId) filter.facilityId = facilityId;
  if (status && status !== 'ALL') filter.status = status;
  if (date) filter.date = date;

  if (search) {
    filter.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { patientPhone: { $regex: search, $options: 'i' } },
      { doctorName: { $regex: search, $options: 'i' } },
      { specialty: { $regex: search, $options: 'i' } },
    ];
  }

  const appointments = await AppointmentModel.find(filter).sort({ createdAt: -1, date: 1, timeSlot: 1 });
  sendSuccess(res, 'Appointments retrieved', appointments.map((a) => a.toJSON()));
}

export async function getAppointmentById(req: Request, res: Response): Promise<void> {
  const { appointmentId } = req.params;
  const apt = await AppointmentModel.findOne({
    $or: [{ id: appointmentId }, { _id: appointmentId }],
  });

  if (!apt) {
    sendError(res, `Appointment ${appointmentId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Appointment retrieved', apt.toJSON());
}

export async function bookAppointment(req: Request, res: Response): Promise<void> {
  const data = req.body;
  const id = data.id || `apt_${Date.now()}`;

  // 1. Resolve facility foreign reference from MongoDB
  let facilityName = data.facilityName;
  let facilityId = data.facilityId;
  if (facilityId || facilityName) {
    const fac = await FacilityModel.findOne({
      $or: [
        { id: facilityId },
        { name: { $regex: facilityName || facilityId, $options: 'i' } },
      ],
    });
    if (fac) {
      facilityId = fac.id;
      facilityName = fac.name;
    }
  }

  // 2. Resolve doctor foreign reference from MongoDB
  let doctorId = data.doctorId || 'unassigned';
  let doctorName = data.doctorName || 'To be assigned at counter';
  let specialty = data.specialty || 'General Medicine';
  let roomNumber = data.roomNumber || 'Room 4';
  if (doctorId && doctorId !== 'unassigned') {
    const doc = await DoctorModel.findOne({
      $or: [
        { id: doctorId },
        { name: { $regex: doctorName || doctorId, $options: 'i' } },
      ],
    });
    if (doc) {
      doctorId = doc.id;
      doctorName = doc.name;
      specialty = doc.specialty || specialty;
    }
  }

  // 3. Resolve patient foreign reference from MongoDB
  let patientId = data.patientId || 'usr_pat_01';
  let patientName = data.patientName || 'Govindbhai Patel';
  let patientPhone = data.patientPhone || '9825011122';
  if (patientId || patientPhone) {
    const pat = await PatientModel.findOne({
      $or: [
        { id: patientId },
        { phone: patientPhone },
      ],
    });
    if (pat) {
      patientId = pat.id;
      patientName = pat.name;
      patientPhone = pat.phone;
    }
  }

  const apt = new AppointmentModel({
    ...data,
    id,
    facilityId: facilityId || 'fac_civil_01',
    facilityName: facilityName || 'Gandhinagar Civil Hospital',
    doctorId,
    doctorName,
    specialty,
    roomNumber,
    patientId,
    patientName,
    patientPhone,
    status: data.status || 'CONFIRMED',
    createdAt: new Date().toISOString(),
  });
  await apt.save();

  // 4. Create Token directly in database if tokenNumber provided or requested
  if (data.tokenNumber || data.createToken) {
    const tokenNum = data.tokenNumber || `OPD-${Math.floor(20 + Math.random() * 50)}`;
    apt.tokenNumber = tokenNum;
    await apt.save();

    const tokenDoc = new TokenModel({
      id: `tok_${Date.now()}`,
      tokenNumber: tokenNum,
      facilityId: apt.facilityId,
      facilityName: apt.facilityName,
      departmentId: 'dept_gen_med',
      departmentName: apt.specialty || 'General Medicine OPD',
      roomNumber: apt.roomNumber || 'Room 4',
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      priority: 'ROUTINE',
      status: 'WAITING',
      queuePosition: 3,
      estimatedWaitMinutes: 15,
      appointmentId: apt.id,
      generatedAt: new Date().toISOString(),
    });
    await tokenDoc.save();
  }

  // Notify hospital queue counter via WebSocket
  if (apt.facilityId) {
    broadcastQueueUpdate(String(apt.facilityId), {
      event: 'APPOINTMENT_BOOKED',
      appointment: apt.toJSON(),
    });
  }

  sendSuccess(res, 'Appointment booked successfully', apt.toJSON(), 201);
}

export async function assignDoctorToAppointment(req: Request, res: Response): Promise<void> {
  const { appointmentId } = req.params;
  const { doctorId, doctorName, specialty, roomNumber, departmentId, departmentName } = req.body;

  if (!doctorId || !doctorName) {
    sendError(res, 'Doctor ID and name are required for assignment', 400);
    return;
  }

  const apt = await AppointmentModel.findOne({ id: appointmentId });
  if (!apt) {
    sendError(res, `Appointment ${appointmentId} not found`, 404);
    return;
  }

  apt.doctorId = doctorId;
  apt.doctorName = doctorName;
  if (specialty) apt.specialty = specialty;
  if (roomNumber) apt.roomNumber = roomNumber;
  if (departmentId) apt.departmentId = departmentId;
  if (departmentName) apt.departmentName = departmentName;

  if (apt.status === 'SCHEDULED') {
    apt.status = 'CONFIRMED';
  }
  await apt.save();

  // Sync token if already issued
  if (apt.tokenNumber) {
    await TokenModel.findOneAndUpdate(
      { tokenNumber: apt.tokenNumber, facilityId: apt.facilityId },
      {
        doctorId,
        doctorName,
        roomNumber: roomNumber || 'Room 4',
        departmentName: specialty || departmentName || 'General Medicine OPD',
      }
    );
  }

  // Update doctor's active patient load
  await DoctorModel.findOneAndUpdate({ id: doctorId }, { $inc: { patientsToday: 1 } });

  // Broadcast real-time update
  if (apt.facilityId) {
    broadcastQueueUpdate(String(apt.facilityId), {
      event: 'DOCTOR_ASSIGNED',
      appointment: apt.toJSON(),
    });
  }

  sendSuccess(res, `Doctor ${doctorName} successfully assigned to ${apt.patientName}`, apt.toJSON());
}

export async function updateAppointment(req: Request, res: Response): Promise<void> {
  const { appointmentId } = req.params;
  const updates = req.body;

  const apt = await AppointmentModel.findOneAndUpdate(
    { id: appointmentId },
    { ...updates },
    { new: true }
  );

  if (!apt) {
    sendError(res, `Appointment ${appointmentId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Appointment updated successfully', apt.toJSON());
}

export async function checkInAppointment(req: Request, res: Response): Promise<void> {
  const { appointmentId } = req.params;
  const { roomNumber, doctorId, doctorName } = req.body || {};

  const apt = await AppointmentModel.findOne({ id: appointmentId });
  if (!apt) {
    sendError(res, `Appointment ${appointmentId} not found`, 404);
    return;
  }

  // If doctor assigned during check-in
  if (doctorId && doctorName) {
    apt.doctorId = doctorId;
    apt.doctorName = doctorName;
  }

  // Count existing tokens today for token number
  const count = await TokenModel.countDocuments({ facilityId: apt.facilityId });
  const tokenNumber = `A-${String(count + 1).padStart(3, '0')}`;

  const assignedRoom = roomNumber || apt.roomNumber || 'Room 4';

  const token = new TokenModel({
    id: `tok_${Date.now()}`,
    tokenNumber,
    patientId: apt.patientId,
    patientName: apt.patientName,
    patientAge: apt.patientAge || 45,
    patientGender: apt.patientGender || 'M',
    patientPhone: apt.patientPhone,
    facilityId: apt.facilityId,
    facilityName: apt.facilityName,
    departmentId: apt.departmentId || 'dep_med',
    departmentName: apt.specialty || 'General Medicine',
    doctorId: apt.doctorId || 'doc_01',
    doctorName: apt.doctorName || 'Dr. Arvind Patel',
    roomNumber: assignedRoom,
    status: 'WAITING',
    priority: 'ROUTINE',
    positionInQueue: count + 1,
    estimatedWaitMinutes: (count + 1) * 10,
    createdAt: new Date().toISOString(),
  });
  await token.save();

  apt.status = 'CHECKED_IN';
  apt.checkedInAt = new Date().toISOString();
  apt.tokenNumber = tokenNumber;
  apt.roomNumber = assignedRoom;
  await apt.save();

  // Broadcast new token to OPD displays
  broadcastTokenCalled(token.toJSON());

  sendSuccess(res, `Patient checked in. Assigned token ${tokenNumber}`, {
    appointment: apt.toJSON(),
    token: token.toJSON(),
  });
}

export async function cancelAppointment(req: Request, res: Response): Promise<void> {
  const { appointmentId } = req.params;

  const apt = await AppointmentModel.findOneAndUpdate(
    { id: appointmentId },
    { status: 'CANCELLED' },
    { new: true }
  );

  if (!apt) {
    sendError(res, `Appointment ${appointmentId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Appointment cancelled successfully', apt.toJSON());
}

// Queues & Live Tokens
export async function getLiveQueue(req: Request, res: Response): Promise<void> {
  const { facilityId } = req.params;
  const { departmentId } = { ...req.query, ...req.body };

  const filter: any = { facilityId };
  if (departmentId) filter.departmentId = departmentId;

  const tokens = await TokenModel.find(filter).sort({ createdAt: 1 });
  const calledToken = tokens.find((t) => t.status === 'CALLED' || t.status === 'IN_CONSULTATION');
  const waitingTokens = tokens.filter((t) => t.status === 'WAITING');

  const liveState = {
    facilityId,
    departmentId: departmentId || 'dep_med',
    departmentName: 'General Medicine OPD',
    currentTokenNumber: calledToken ? calledToken.tokenNumber : 'A-035',
    callingRoom: calledToken?.roomNumber || 'Room 4',
    totalWaiting: waitingTokens.length,
    averageConsultTimeMinutes: 12,
    tokens: tokens.map((t) => t.toJSON()),
    updatedAt: new Date().toISOString(),
  };

  sendSuccess(res, 'Live queue retrieved', liveState);
}

export async function callNext(req: Request, res: Response): Promise<void> {
  const { facilityId } = req.params;
  const { departmentId } = req.body;

  const filter: any = { facilityId, status: 'WAITING' };
  if (departmentId) filter.departmentId = departmentId;

  // Find next waiting token
  const nextToken = await TokenModel.findOne(filter).sort({ createdAt: 1 });

  if (nextToken) {
    nextToken.status = 'CALLED';
    nextToken.calledAt = new Date().toISOString();
    nextToken.positionInQueue = 0;
    nextToken.estimatedWaitMinutes = 0;
    await nextToken.save();

    // Broadcast through socket
    broadcastTokenCalled(nextToken.toJSON());
  }

  const allTokens = await TokenModel.find({ facilityId }).sort({ createdAt: 1 });
  const waiting = allTokens.filter((t) => t.status === 'WAITING');

  const queueState = {
    facilityId,
    departmentId: departmentId || 'dep_med',
    departmentName: 'General Medicine OPD',
    currentTokenNumber: nextToken ? nextToken.tokenNumber : 'A-042',
    callingRoom: nextToken?.roomNumber || 'Room 4',
    totalWaiting: waiting.length,
    averageConsultTimeMinutes: 12,
    tokens: allTokens.map((t) => t.toJSON()),
    updatedAt: new Date().toISOString(),
  };

  broadcastQueueUpdate(String(facilityId), queueState);

  sendSuccess(res, 'Next token called successfully', {
    calledToken: nextToken ? nextToken.toJSON() : null,
    queue: queueState,
  });
}

export async function skipToken(req: Request, res: Response): Promise<void> {
  const { tokenId } = req.body;

  const token = await TokenModel.findOneAndUpdate(
    { id: tokenId },
    { status: 'SKIPPED' },
    { new: true }
  );

  if (!token) {
    sendError(res, `Token ${tokenId} not found`, 404);
    return;
  }

  sendSuccess(res, `Token ${token.tokenNumber} skipped`, token.toJSON());
}

export async function noShowToken(req: Request, res: Response): Promise<void> {
  const { tokenId } = req.body;

  const token = await TokenModel.findOneAndUpdate(
    { id: tokenId },
    { status: 'NO_SHOW' },
    { new: true }
  );

  if (!token) {
    sendError(res, `Token ${tokenId} not found`, 404);
    return;
  }

  sendSuccess(res, `Token ${token.tokenNumber} marked as no-show`, token.toJSON());
}

// Generate Token Directly
export async function generateToken(req: Request, res: Response): Promise<void> {
  const data = req.body;
  const count = await TokenModel.countDocuments({ facilityId: data.facilityId });
  const tokenNumber = `A-${String(count + 1).padStart(3, '0')}`;

  const token = new TokenModel({
    id: `tok_${Date.now()}`,
    tokenNumber,
    patientId: data.patientId || `usr_pat_${Date.now()}`,
    patientName: data.patientName,
    patientAge: data.patientAge || 40,
    patientGender: data.patientGender || 'M',
    patientPhone: data.patientPhone,
    facilityId: data.facilityId,
    facilityName: data.facilityName || 'Gandhinagar Civil Hospital',
    departmentId: data.departmentId || 'dep_med',
    departmentName: data.departmentName || 'General Medicine OPD',
    status: 'WAITING',
    priority: data.priority || 'ROUTINE',
    positionInQueue: count + 1,
    estimatedWaitMinutes: (count + 1) * 12,
    createdAt: new Date().toISOString(),
  });
  await token.save();

  sendSuccess(res, `Token ${tokenNumber} generated successfully`, token.toJSON(), 201);
}

export async function getTokenById(req: Request, res: Response): Promise<void> {
  const { tokenId } = req.params;
  const token = await TokenModel.findOne({ id: tokenId });

  if (!token) {
    sendError(res, `Token ${tokenId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Token retrieved', token.toJSON());
}

export async function cancelToken(req: Request, res: Response): Promise<void> {
  const { tokenId } = req.params;

  const token = await TokenModel.findOneAndUpdate(
    { id: tokenId },
    { status: 'CANCELLED' },
    { new: true }
  );

  if (!token) {
    sendError(res, `Token ${tokenId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Token cancelled', token.toJSON());
}
