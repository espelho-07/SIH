import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import { RoleModel } from '../models/Role';
import { FacilityModel } from '../models/Facility';
import { DoctorModel } from '../models/Doctor';
import { DistrictAdminModel } from '../models/DistrictAdmin';
import { AiModelModel, AuditLogModel } from '../models/Admin';
import { sendSuccess, sendError } from '../utils/response';
import { getOpenSocketConnections } from '../sockets/socketHandler';

export async function getRoles(_req: Request, res: Response): Promise<void> {
  const roles = await RoleModel.find().sort({ level: 1, name: 1 });
  sendSuccess(res, 'Roles retrieved successfully', roles.map((r) => r.toJSON()));
}

export async function getSystemHealth(_req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  let dbStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';
  let dbLatency = 5;

  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      dbLatency = Date.now() - startTime;
    } else {
      dbStatus = 'DOWN';
    }
  } catch {
    dbStatus = 'DOWN';
  }

  const activeUsersCount = await UserModel.countDocuments();
  const openSocketConnections = getOpenSocketConnections();

  const healthOverview = {
    overallStatus: dbStatus === 'HEALTHY' ? 'HEALTHY' : 'CRITICAL',
    services: [
      {
        name: 'Express API Gateway',
        status: 'HEALTHY',
        latencyMs: 8,
        uptimePercent: 99.98,
        lastChecked: new Date().toISOString(),
        details: 'Serving /api/v1 endpoints with CORS & Helmet security',
      },
      {
        name: 'MongoDB HealthConnect Primary',
        status: dbStatus,
        latencyMs: dbLatency,
        uptimePercent: 99.95,
        lastChecked: new Date().toISOString(),
        details: 'MongoDB cluster on 127.0.0.1:27017/healthconnect',
      },
      {
        name: 'Telemedicine WebRTC Signaling',
        status: 'HEALTHY',
        latencyMs: 12,
        uptimePercent: 99.9,
        lastChecked: new Date().toISOString(),
        details: 'WebSocket server handling live consult channels',
      },
      {
        name: 'ML Disease Classifier & Surge Model',
        status: 'HEALTHY',
        latencyMs: 15,
        uptimePercent: 99.85,
        lastChecked: new Date().toISOString(),
        details: 'RandomForest & LSTM surge models serving telemetry',
      },
    ],
    activeUsersCount,
    openSocketConnections,
    totalErrorsLast24h: 0,
    queuedBackgroundJobs: 0,
  };

  sendSuccess(res, 'Realtime system services status retrieved', healthOverview);
}

export async function getAdminUsers(req: Request, res: Response): Promise<void> {
  const caller = (req as any).user;
  const { district, facilityId, role, status, search } = req.query;

  const filter: any = {};

  // Role-based Scoping:
  if (caller?.role === 'DISTRICT_ADMIN') {
    // District Admin only sees users within their assigned district
    filter.district = caller.district || 'Gandhinagar';
  } else if (district && district !== 'ALL') {
    filter.district = district;
  }

  if (facilityId && facilityId !== 'ALL') {
    filter.facilityId = facilityId;
  }

  if (role && role !== 'ALL') {
    filter.role = role;
  }

  if (status && status !== 'ALL') {
    filter.status = status;
  }

  if (search) {
    const sRegex = new RegExp(String(search).trim(), 'i');
    filter.$or = [
      { name: sRegex },
      { username: sRegex },
      { phone: sRegex },
      { email: sRegex },
      { facilityName: sRegex },
      { specialty: sRegex },
    ];
  }

  const users = await UserModel.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, 'User registry retrieved successfully', users.map((u) => u.toJSON()));
}

export async function createAdminUser(req: Request, res: Response): Promise<void> {
  const caller = (req as any).user;
  const {
    name,
    phone,
    email,
    username,
    password,
    role,
    staffSubType,
    facilityId,
    facilityName,
    district,
    department,
    designation,
    specialty,
    qualification,
  } = req.body;

  if (!name || !phone || !role) {
    sendError(res, 'Name, phone, and role are required fields.', 400);
    return;
  }

  const generatedUser = name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
  const finalUsername = String(username || email?.split('@')[0] || generatedUser).trim();
  const finalPassword = String(password || 'Health@123').trim();

  if (finalPassword.length < 4) {
    sendError(res, 'Password must be at least 4 characters long.', 400);
    return;
  }

  // Permission & Scope Enforcement:
  let targetDistrict = district || 'Gandhinagar';
  let targetFacilityId = facilityId;
  let targetFacilityName = facilityName;

  if (caller?.role === 'DISTRICT_ADMIN') {
    const callerDistrict = caller.district || 'Gandhinagar';

    // District Admin CANNOT create Super Admins
    if (role === 'SUPER_ADMIN') {
      sendError(res, 'District Administrators cannot create Super Administrator accounts.', 403);
      return;
    }

    // If district was explicitly passed and differs from caller's district
    if (district && district.trim().toLowerCase() !== callerDistrict.trim().toLowerCase()) {
      sendError(res, `District Administrators can only create users in their assigned district (${callerDistrict}).`, 403);
      return;
    }
    targetDistrict = callerDistrict;

    // Verify facility belongs to the District Admin's district
    if (targetFacilityId) {
      const facilityInDistrict = await FacilityModel.findOne({ id: targetFacilityId });
      if (facilityInDistrict && facilityInDistrict.district.trim().toLowerCase() !== callerDistrict.trim().toLowerCase()) {
        sendError(res, `Facility does not belong to your assigned district (${callerDistrict}).`, 403);
        return;
      }
      if (facilityInDistrict) {
        targetFacilityName = facilityInDistrict.name;
      }
    }
  } else if (targetFacilityId) {
    const facilityDoc = await FacilityModel.findOne({ id: targetFacilityId });
    if (facilityDoc) {
      targetFacilityName = facilityDoc.name;
      if (!district) targetDistrict = facilityDoc.district;
    }
  }

  const existing = await UserModel.findOne({
    $or: [
      { username: { $regex: new RegExp(`^${finalUsername}$`, 'i') } },
      { phone: String(phone).trim() },
    ],
  });

  if (existing) {
    if (existing.username?.toLowerCase() === finalUsername.toLowerCase()) {
      sendError(res, `Username "${finalUsername}" is already in use. Please choose a unique username.`, 400);
      return;
    }
    if (existing.phone === String(phone).trim() && existing.role === role) {
      sendError(res, `A user with phone number "${phone}" and role "${role}" already exists.`, 400);
      return;
    }
  }

  const newId = `usr_${Date.now()}`;
  const user = await UserModel.create({
    id: newId,
    name,
    username: finalUsername,
    password: finalPassword,
    phone: String(phone).trim(),
    email: email || `${finalUsername}@gujarat.health.gov.in`,
    role,
    staffSubType: role === 'FACILITY_STAFF' ? (staffSubType || 'REGISTRATION_CLERK') : undefined,
    facilityId: targetFacilityId,
    facilityName: targetFacilityName,
    district: targetDistrict,
    department: department || (role === 'DOCTOR' ? (specialty ? `${specialty} OPD` : 'General Medicine OPD') : undefined),
    designation: designation || (role === 'DOCTOR' ? (specialty ? `Specialist (${specialty})` : 'Medical Officer') : role === 'FACILITY_STAFF' ? (staffSubType || 'Staff') : role),
    specialty: role === 'DOCTOR' ? (specialty || 'General Medicine') : undefined,
    qualification: qualification || (role === 'DOCTOR' ? 'MBBS, MD' : undefined),
    status: 'ACTIVE',
  });

  // If role is DOCTOR, automatically sync / create in DoctorModel so doctor appears in live roster
  if (role === 'DOCTOR') {
    const docId = `doc_${Date.now()}`;
    await DoctorModel.findOneAndUpdate(
      { $or: [{ name }, { phone: String(phone).trim() }] },
      {
        $set: {
          id: docId,
          name,
          specialty: specialty || 'General Medicine',
          qualification: qualification || 'MBBS, MD',
          facilityId: targetFacilityId || 'fac_civil_01',
          facilityName: targetFacilityName || 'Gandhinagar Civil Hospital & Medical College',
          district: targetDistrict,
          roomNumber: 'OPD Room 4',
          isAvailable: true,
          status: 'ON_DUTY',
          teleconsultEnabled: true,
        },
      },
      { upsert: true, new: true }
    );
  }

  // If role is DISTRICT_ADMIN, automatically sync in DistrictAdminModel
  if (role === 'DISTRICT_ADMIN') {
    const daId = `usr_dist_${targetDistrict.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    await DistrictAdminModel.findOneAndUpdate(
      { $or: [{ username: finalUsername }, { district: targetDistrict }] },
      {
        $set: {
          id: daId,
          name,
          username: finalUsername,
          password: finalPassword,
          email: email || `${finalUsername}@gujarat.health.gov.in`,
          phone: String(phone).trim(),
          district: targetDistrict,
          designation: designation || 'Chief District Health Officer (CDHO)',
          status: 'ACTIVE',
          appointedAt: new Date().toISOString().slice(0, 10),
          appointedBy: caller?.name || 'State Health Authority',
          jurisdictionFacilitiesCount: 14,
          privileges: ['FACILITY_MANAGEMENT', 'DOCTOR_POSTINGS', 'AI_RESOURCE_INTELLIGENCE'],
        },
      },
      { upsert: true, new: true }
    );
  }

  // Audit Log
  await AuditLogModel.create({
    id: `aud_${Date.now()}`,
    action: 'USER_CREATE',
    actorId: caller?.id || 'admin',
    actorName: caller?.name || 'Administrator',
    actorRole: caller?.role || 'SUPER_ADMIN',
    resourceType: 'USER_REGISTRY',
    resourceId: newId,
    details: `Created new ${role} user "${name}" (@${finalUsername}) assigned to Hospital: "${targetFacilityName || 'Statewide'}", District: "${targetDistrict}"`,
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
  });

  sendSuccess(res, `User ${name} created successfully with login credentials`, {
    ...user.toJSON(),
    credentials: { username: finalUsername, password: finalPassword },
  }, 201);
}

export async function updateAdminUser(req: Request, res: Response): Promise<void> {
  const caller = (req as any).user;
  const { id } = req.params;
  const updateData = req.body;

  const targetUser = await UserModel.findOne({ $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }] });
  if (!targetUser) {
    sendError(res, 'User not found', 404);
    return;
  }

  // Scope Validation:
  if (caller?.role === 'DISTRICT_ADMIN') {
    if (targetUser.district !== caller.district) {
      sendError(res, 'You are not authorized to modify users outside your assigned district.', 403);
      return;
    }
    if (targetUser.role === 'SUPER_ADMIN' || updateData.role === 'SUPER_ADMIN') {
      sendError(res, 'District Administrators cannot manage Super Administrator accounts.', 403);
      return;
    }
  }

  if (updateData.facilityId && updateData.facilityId !== targetUser.facilityId) {
    const fac = await FacilityModel.findOne({ id: updateData.facilityId });
    if (fac) {
      updateData.facilityName = fac.name;
      if (caller?.role === 'SUPER_ADMIN') {
        updateData.district = fac.district;
      }
    }
  }

  Object.assign(targetUser, updateData);
  await targetUser.save();

  sendSuccess(res, `User ${targetUser.name} updated successfully`, targetUser.toJSON());
}

export async function deleteAdminUser(req: Request, res: Response): Promise<void> {
  const caller = (req as any).user;
  const { id } = req.params;

  const targetUser = await UserModel.findOne({ $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : undefined }] });
  if (!targetUser) {
    sendError(res, 'User not found', 404);
    return;
  }

  if (caller?.role === 'DISTRICT_ADMIN') {
    if (targetUser.district !== caller.district || targetUser.role === 'SUPER_ADMIN') {
      sendError(res, 'You are not authorized to delete this user.', 403);
      return;
    }
  }

  targetUser.status = 'INACTIVE';
  await targetUser.save();

  sendSuccess(res, `User ${targetUser.name} deactivated successfully`, { id: targetUser.id, status: 'INACTIVE' });
}

export async function getPermissionMatrix(_req: Request, res: Response): Promise<void> {
  const matrix = [
    {
      module: 'PATIENTS',
      patient: { read: true, write: true, create: false, delete: false },
      asha: { read: true, write: true, create: true, delete: false },
      doctor: { read: true, write: true, create: true, delete: false },
      staff: { read: true, write: true, create: true, delete: false },
      districtAdmin: { read: true, write: false, create: false, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
    {
      module: 'APPOINTMENTS',
      patient: { read: true, write: true, create: true, delete: true },
      asha: { read: true, write: true, create: true, delete: false },
      doctor: { read: true, write: true, create: true, delete: false },
      staff: { read: true, write: true, create: true, delete: true },
      districtAdmin: { read: true, write: false, create: false, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
    {
      module: 'QUEUE',
      patient: { read: true, write: false, create: false, delete: false },
      asha: { read: true, write: false, create: false, delete: false },
      doctor: { read: true, write: true, create: true, delete: false },
      staff: { read: true, write: true, create: true, delete: false },
      districtAdmin: { read: true, write: false, create: false, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
    {
      module: 'EHR',
      patient: { read: true, write: false, create: false, delete: false },
      asha: { read: true, write: true, create: true, delete: false },
      doctor: { read: true, write: true, create: true, delete: false },
      staff: { read: true, write: false, create: false, delete: false },
      districtAdmin: { read: true, write: false, create: false, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
    {
      module: 'REFERRALS',
      patient: { read: true, write: false, create: false, delete: false },
      asha: { read: true, write: true, create: true, delete: false },
      doctor: { read: true, write: true, create: true, delete: false },
      staff: { read: true, write: true, create: false, delete: false },
      districtAdmin: { read: true, write: true, create: false, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
    {
      module: 'RESOURCES',
      patient: { read: true, write: false, create: false, delete: false },
      asha: { read: true, write: false, create: false, delete: false },
      doctor: { read: true, write: false, create: false, delete: false },
      staff: { read: true, write: true, create: true, delete: false },
      districtAdmin: { read: true, write: true, create: true, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
    {
      module: 'AI_INSIGHTS',
      patient: { read: false, write: false, create: false, delete: false },
      asha: { read: false, write: false, create: false, delete: false },
      doctor: { read: true, write: false, create: false, delete: false },
      staff: { read: true, write: false, create: false, delete: false },
      districtAdmin: { read: true, write: true, create: true, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
    {
      module: 'SYSTEM_CONFIG',
      patient: { read: false, write: false, create: false, delete: false },
      asha: { read: false, write: false, create: false, delete: false },
      doctor: { read: false, write: false, create: false, delete: false },
      staff: { read: false, write: false, create: false, delete: false },
      districtAdmin: { read: false, write: false, create: false, delete: false },
      superAdmin: { read: true, write: true, create: true, delete: true },
    },
  ];

  sendSuccess(res, 'Role-permission matrix retrieved', matrix);
}

export async function getAiModels(_req: Request, res: Response): Promise<void> {
  const models = await AiModelModel.find();
  sendSuccess(res, 'AI Model registry retrieved', models.map((m) => m.toJSON()));
}

export async function deployAiModel(req: Request, res: Response): Promise<void> {
  const { modelId } = req.params;

  await AiModelModel.findOneAndUpdate(
    { id: modelId },
    { status: 'ACTIVE', deployedAt: new Date().toISOString() }
  );

  sendSuccess(res, `Model ${modelId} deployed to active production cluster`, { deployed: true });
}

export async function rollbackAiModel(req: Request, res: Response): Promise<void> {
  const { modelId } = req.params;

  await AiModelModel.findOneAndUpdate(
    { id: modelId },
    { status: 'ARCHIVED' }
  );

  sendSuccess(res, `Model ${modelId} rolled back to previous checkpoint`, { rolledBack: true });
}

export async function getAuditLogs(req: Request, res: Response): Promise<void> {
  const { action, role } = req.query;
  const filter: any = {};
  if (action) filter.action = action;
  if (role) filter.actorRole = role;

  const logs = await AuditLogModel.find(filter).sort({ timestamp: -1 });
  sendSuccess(res, 'Audit logs retrieved', logs.map((l) => l.toJSON()));
}
