import { Request, Response } from 'express';
import {
  OperationalServiceModel,
  OperationalAnnouncementModel,
  OperationalIssueModel,
  StaffDutyItemModel,
  DoctorLeaveModel,
} from '../models/Operations';
import { TokenModel } from '../models/Queue';
import { ReferralModel } from '../models/Referral';
import { BedSummaryModel } from '../models/Resource';
import { AmbulanceModel } from '../models/Resource';
import { sendSuccess, sendError } from '../utils/response';

export async function getOperationsSummary(req: Request, res: Response): Promise<void> {
  const facilityId = req.query.facilityId || req.body.facilityId || 'fac_civil_01';

  const [services, announcements, issues, waitingTokens, bedSummary, ambulances, pendingReferrals, leaves] =
    await Promise.all([
      OperationalServiceModel.find(),
      OperationalAnnouncementModel.find({ active: true }),
      OperationalIssueModel.find({ resolved: false }),
      TokenModel.countDocuments({ status: 'WAITING' }),
      BedSummaryModel.findOne({ facilityId }),
      AmbulanceModel.find(),
      ReferralModel.countDocuments({ toFacilityId: facilityId, status: { $in: ['SENT', 'UNDER_REVIEW', 'ACCEPTED'] } }),
      DoctorLeaveModel.countDocuments({ status: 'PENDING' }),
    ]);

  const ambulancesReady = ambulances.filter((a) => a.status === 'AVAILABLE').length;

  const summary = {
    facilityId: String(facilityId),
    facilityName: bedSummary?.facilityName || 'Gandhinagar Civil Hospital & Medical College',
    operationalStatus: 'OPEN',
    statusReason: 'Normal operating conditions across all clinical & emergency wings',
    lastStatusUpdate: new Date().toISOString(),
    updatedBy: 'Operations Coordinator',
    totalActiveIssues: issues.length,
    criticalIssuesCount: issues.filter((i) => i.severity === 'CRITICAL').length,
    services: services.map((s) => s.toJSON()),
    announcements: announcements.map((a) => a.toJSON()),
    telemetry: {
      totalWaitingQueue: waitingTokens,
      avgQueueWaitMinutes: Math.max(10, waitingTokens * 3),
      bedsOccupied: bedSummary?.totalOccupied || 18,
      bedsTotal: bedSummary?.totalBeds || 50,
      bedsAvailable: bedSummary?.totalAvailable || 32,
      icuAvailable: bedSummary?.icuAvailable || 4,
      ambulancesReady,
      ambulancesTotal: ambulances.length || 5,
      pendingIncomingReferrals: pendingReferrals,
      staffOnDutyCount: 14,
      pendingStaffLeavesCount: leaves,
    },
  };

  sendSuccess(res, 'Operations summary and telemetry retrieved', summary);
}

export async function updateOperationalStatus(req: Request, res: Response): Promise<void> {
  const { status, reason, updatedBy = 'Operations Coordinator' } = req.body;

  sendSuccess(res, 'Facility operational status updated', {
    status,
    reason,
    updatedAt: new Date().toISOString(),
    updatedBy,
  });
}

// Services
export async function getOperationalServices(_req: Request, res: Response): Promise<void> {
  const services = await OperationalServiceModel.find();
  sendSuccess(res, 'Operational services retrieved', services.map((s) => s.toJSON()));
}

export async function updateServiceStatus(req: Request, res: Response): Promise<void> {
  const { serviceId } = req.params;
  const { status, reason, notes } = req.body;

  const service = await OperationalServiceModel.findOneAndUpdate(
    { id: serviceId },
    {
      status,
      statusReason: reason,
      notes,
      lastUpdated: new Date().toISOString(),
    },
    { new: true }
  );

  if (!service) {
    sendError(res, `Service ${serviceId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Service operational status updated', service.toJSON());
}

// Announcements
export async function getAnnouncements(_req: Request, res: Response): Promise<void> {
  const announcements = await OperationalAnnouncementModel.find().sort({ createdAt: -1 });
  sendSuccess(res, 'Announcements retrieved', announcements.map((a) => a.toJSON()));
}

export async function createAnnouncement(req: Request, res: Response): Promise<void> {
  const { title, message, severity = 'INFO', author = 'Operations Coordinator' } = req.body;
  const announcement = new OperationalAnnouncementModel({
    id: `ann_${Date.now()}`,
    title,
    message,
    severity,
    author,
    createdAt: new Date().toISOString(),
    active: true,
  });
  await announcement.save();

  sendSuccess(res, 'Announcement broadcasted successfully', announcement.toJSON(), 201);
}

// Issues
export async function getIssues(_req: Request, res: Response): Promise<void> {
  const issues = await OperationalIssueModel.find().sort({ timestamp: -1 });
  sendSuccess(res, 'Operational issues retrieved', issues.map((i) => i.toJSON()));
}

export async function resolveIssue(req: Request, res: Response): Promise<void> {
  const { issueId } = req.params;
  const { resolvedBy = 'Operations Coordinator' } = req.body;

  const issue = await OperationalIssueModel.findOneAndUpdate(
    { id: issueId },
    {
      resolved: true,
      resolvedAt: new Date().toISOString(),
      resolvedBy,
    },
    { new: true }
  );

  if (!issue) {
    sendError(res, `Issue ${issueId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Issue resolved successfully', issue.toJSON());
}

// Staff Duty
export async function getStaffDuty(_req: Request, res: Response): Promise<void> {
  const staff = await StaffDutyItemModel.find();
  sendSuccess(res, 'Staff duty roster retrieved', staff.map((s) => s.toJSON()));
}

// Broadcast Queue Delay
export async function broadcastQueueDelay(req: Request, res: Response): Promise<void> {
  const { departmentId, delayMinutes } = req.body;
  sendSuccess(res, `Queue delay of ${delayMinutes} minutes broadcasted for department ${departmentId}`, {
    departmentId,
    delayMinutes,
    broadcastAt: new Date().toISOString(),
  });
}

// Doctor Leaves
export async function getLeaves(req: Request, res: Response): Promise<void> {
  const { facilityId, doctorId, status } = req.query;
  const filter: any = {};
  if (facilityId) filter.facilityId = facilityId;
  if (doctorId) filter.doctorId = doctorId;
  if (status) filter.status = status;

  const leaves = await DoctorLeaveModel.find(filter).sort({ createdAt: -1 });
  sendSuccess(res, 'Doctor leaves retrieved', leaves.map((l) => l.toJSON()));
}

export async function getLeaveById(req: Request, res: Response): Promise<void> {
  const { leaveId } = req.params;
  const leave = await DoctorLeaveModel.findOne({ id: leaveId });

  if (!leave) {
    sendError(res, `Leave ${leaveId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Doctor leave retrieved', leave.toJSON());
}

export async function getLeaveImpact(req: Request, res: Response): Promise<void> {
  const { doctorId, startDate, endDate, facilityId = 'fac_civil_01' } = req.query;

  const impact = {
    doctorId: String(doctorId),
    doctorName: 'Dr. Arvind Patel',
    specialty: 'Cardiology',
    facilityId: String(facilityId),
    facilityName: 'Gandhinagar Civil Hospital',
    startDate: String(startDate),
    endDate: String(endDate),
    totalDays: 4,
    totalDoctorsInDepartment: 3,
    availableDoctorsDuringPeriod: 2,
    coverageStatus: 'ADEQUATE',
    affectedAppointmentsCount: 2,
    serviceCoverageImpact: 'ADEQUATE',
    handoverDoctorName: 'Dr. Rajesh Solanki',
  };

  sendSuccess(res, 'Leave operational impact assessed', impact);
}

export async function applyLeave(req: Request, res: Response): Promise<void> {
  const data = req.body;
  const id = data.id || `leave_${Date.now()}`;

  const leave = new DoctorLeaveModel({
    ...data,
    id,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  });
  await leave.save();

  sendSuccess(res, 'Leave application submitted successfully', leave.toJSON(), 201);
}

export async function approveLeave(req: Request, res: Response): Promise<void> {
  const { leaveId } = req.params;
  const { reviewerName = 'Facility Operations Coordinator' } = req.body;

  const leave = await DoctorLeaveModel.findOneAndUpdate(
    { id: leaveId },
    {
      status: 'APPROVED',
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
    },
    { new: true }
  );

  if (!leave) {
    sendError(res, `Leave ${leaveId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Leave approved successfully', leave.toJSON());
}

export async function rejectLeave(req: Request, res: Response): Promise<void> {
  const { leaveId } = req.params;
  const { reason, reviewerName = 'Facility Operations Coordinator' } = req.body;

  const leave = await DoctorLeaveModel.findOneAndUpdate(
    { id: leaveId },
    {
      status: 'REJECTED',
      rejectionReason: reason,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
    },
    { new: true }
  );

  if (!leave) {
    sendError(res, `Leave ${leaveId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Leave rejected', leave.toJSON());
}

export async function requestChanges(req: Request, res: Response): Promise<void> {
  const { leaveId } = req.params;
  const { note, reviewerName = 'Facility Operations Coordinator' } = req.body;

  const leave = await DoctorLeaveModel.findOneAndUpdate(
    { id: leaveId },
    {
      status: 'CHANGES_REQUIRED',
      changesRequestedNote: note,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString(),
    },
    { new: true }
  );

  if (!leave) {
    sendError(res, `Leave ${leaveId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Changes requested for leave', leave.toJSON());
}

export async function cancelLeave(req: Request, res: Response): Promise<void> {
  const { leaveId } = req.params;

  const leave = await DoctorLeaveModel.findOneAndUpdate(
    { id: leaveId },
    { status: 'CANCELLED' },
    { new: true }
  );

  if (!leave) {
    sendError(res, `Leave ${leaveId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Leave cancelled successfully', { cancelled: true });
}
