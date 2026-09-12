import mongoose, { Schema, Document } from 'mongoose';

export interface IOperationalService extends Document {
  serviceId: string;
  facilityId: string;
  name: string;
  code: string;
  category: 'CLINICAL_OPD' | 'EMERGENCY_ICU' | 'DIAGNOSTICS' | 'PHARMACY' | 'SUPPORT_SERVICES';
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  operatingHours: string;
  currentWaitMinutes: number;
  activeStaffCount: number;
  statusReason?: string;
  notes?: string;
  lastUpdated: string;
}

const OperationalServiceSchema = new Schema<IOperationalService>(
  {
    serviceId: { type: String, required: true, unique: true, index: true },
    facilityId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    category: {
      type: String,
      enum: ['CLINICAL_OPD', 'EMERGENCY_ICU', 'DIAGNOSTICS', 'PHARMACY', 'SUPPORT_SERVICES'],
      default: 'CLINICAL_OPD',
    },
    status: {
      type: String,
      enum: ['OPERATIONAL', 'DEGRADED', 'OFFLINE'],
      default: 'OPERATIONAL',
    },
    operatingHours: { type: String, default: '24x7' },
    currentWaitMinutes: { type: Number, default: 0 },
    activeStaffCount: { type: Number, default: 1 },
    statusReason: { type: String },
    notes: { type: String },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.serviceId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const OperationalService = mongoose.model<IOperationalService>(
  'OperationalService',
  OperationalServiceSchema
);

// Operational Announcements
export interface IOperationalAnnouncement extends Document {
  announcementId: string;
  facilityId: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'URGENT';
  author: string;
  active: boolean;
  createdAt: Date;
}

const OperationalAnnouncementSchema = new Schema<IOperationalAnnouncement>(
  {
    announcementId: { type: String, required: true, unique: true, index: true },
    facilityId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['INFO', 'WARNING', 'URGENT'], default: 'INFO' },
    author: { type: String, default: 'Operations Coordinator' },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.announcementId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const OperationalAnnouncement = mongoose.model<IOperationalAnnouncement>(
  'OperationalAnnouncement',
  OperationalAnnouncementSchema
);

// Operational Issues
export interface IOperationalIssue extends Document {
  issueId: string;
  facilityId: string;
  severity: 'CRITICAL' | 'ATTENTION' | 'INFORMATIONAL';
  category: 'QUEUE' | 'REFERRAL' | 'RESOURCE' | 'STAFF' | 'SERVICE' | 'DIAGNOSTIC';
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

const OperationalIssueSchema = new Schema<IOperationalIssue>(
  {
    issueId: { type: String, required: true, unique: true, index: true },
    facilityId: { type: String, required: true, index: true },
    severity: { type: String, enum: ['CRITICAL', 'ATTENTION', 'INFORMATIONAL'], default: 'ATTENTION' },
    category: {
      type: String,
      enum: ['QUEUE', 'REFERRAL', 'RESOURCE', 'STAFF', 'SERVICE', 'DIAGNOSTIC'],
      default: 'QUEUE',
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    actionLabel: { type: String, default: 'Investigate' },
    actionPath: { type: String, default: '/facility-operations/queues' },
    timestamp: { type: String, default: () => new Date().toISOString() },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: String },
    resolvedBy: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.issueId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const OperationalIssue = mongoose.model<IOperationalIssue>(
  'OperationalIssue',
  OperationalIssueSchema
);

// Staff Duty Roster
export interface IStaffDuty extends Document {
  dutyId: string;
  facilityId: string;
  name: string;
  role: string;
  department: string;
  shift: 'MORNING' | 'EVENING' | 'NIGHT' | 'GENERAL';
  status: 'ON_DUTY' | 'ON_BREAK' | 'OFF_DUTY' | 'ON_CALL';
  contactPhone: string;
  assignedLocation: string;
}

const StaffDutySchema = new Schema<IStaffDuty>(
  {
    dutyId: { type: String, required: true, unique: true, index: true },
    facilityId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    shift: { type: String, enum: ['MORNING', 'EVENING', 'NIGHT', 'GENERAL'], default: 'GENERAL' },
    status: { type: String, enum: ['ON_DUTY', 'ON_BREAK', 'OFF_DUTY', 'ON_CALL'], default: 'ON_DUTY' },
    contactPhone: { type: String, default: '9876543210' },
    assignedLocation: { type: String, default: 'Main Complex' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret.dutyId || ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const StaffDuty = mongoose.model<IStaffDuty>('StaffDuty', StaffDutySchema);
