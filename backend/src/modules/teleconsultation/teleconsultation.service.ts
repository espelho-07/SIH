import mongoose from 'mongoose';
import { TeleconsultationRepository } from './teleconsultation.repository';
import { Doctor } from '../../models/Doctor';
import { Hospital } from '../../models/Hospital';
import { CreateTeleconsultationInput, TeleconsultationQuery } from './teleconsultation.schema';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { TeleconsultationStatus } from '../../models/Teleconsultation';

export class TeleconsultationService {
  private repository: TeleconsultationRepository;

  constructor() {
    this.repository = new TeleconsultationRepository();
  }

  async requestTeleconsultation(patientId: string, input: CreateTeleconsultationInput) {
    const { doctorId, hospitalId, appointmentId, reason } = input;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new NotFoundError(`Doctor with ID '${doctorId}' not found`, 'DOCTOR_NOT_FOUND');
    }
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor || !doctor.isActive || doctor.availabilityStatus !== 'AVAILABLE') {
      throw new BadRequestError(`Doctor '${doctor?.name || doctorId}' is currently unavailable for teleconsultation`, 'DOCTOR_UNAVAILABLE');
    }

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      throw new NotFoundError(`Hospital with ID '${hospitalId}' not found`, 'HOSPITAL_NOT_FOUND');
    }
    const hospital = await Hospital.findById(hospitalId).lean();
    if (!hospital || !hospital.isActive) {
      throw new BadRequestError(`Hospital '${hospital?.name || hospitalId}' is currently inactive`, 'HOSPITAL_UNAVAILABLE');
    }

    if (doctor.hospitalId.toString() !== hospitalId) {
      throw new BadRequestError(`Doctor '${doctor.name}' does not belong to hospital '${hospital.name}'`, 'DOCTOR_NOT_IN_HOSPITAL');
    }

    return this.repository.createTeleconsultation({
      patientId,
      doctorId,
      hospitalId,
      appointmentId,
      reason,
    });
  }

  async getPatientConsultations(patientId: string, query: TeleconsultationQuery) {
    return this.repository.findPatientConsultations(patientId, query);
  }

  async getConsultationDetails(consultationId: string, userId: string, userRole: string) {
    const consultation = await this.repository.findConsultationById(consultationId);
    if (!consultation) {
      throw new NotFoundError(`Teleconsultation with ID '${consultationId}' not found`, 'TELECONSULTATION_NOT_FOUND');
    }

    this.verifyParticipantAccess(consultation, userId, userRole);

    const messages = await this.repository.getConsultationMessages(consultationId);

    return {
      consultation,
      messages,
    };
  }

  async acceptConsultation(consultationId: string, userId: string, userRole: string) {
    const consultation = await this.repository.findConsultationById(consultationId);
    if (!consultation) {
      throw new NotFoundError(`Teleconsultation with ID '${consultationId}' not found`, 'TELECONSULTATION_NOT_FOUND');
    }

    this.verifyStaffOrDoctorAccess(consultation, userId, userRole);

    if (consultation.status !== 'REQUESTED') {
      throw new BadRequestError(`Cannot accept consultation in status '${consultation.status}'`, 'INVALID_CONSULTATION_STATUS');
    }

    return this.repository.updateStatus(consultationId, 'ACCEPTED');
  }

  async rejectConsultation(consultationId: string, userId: string, userRole: string) {
    const consultation = await this.repository.findConsultationById(consultationId);
    if (!consultation) {
      throw new NotFoundError(`Teleconsultation with ID '${consultationId}' not found`, 'TELECONSULTATION_NOT_FOUND');
    }

    this.verifyStaffOrDoctorAccess(consultation, userId, userRole);

    if (consultation.status !== 'REQUESTED') {
      throw new BadRequestError(`Cannot reject consultation in status '${consultation.status}'`, 'INVALID_CONSULTATION_STATUS');
    }

    return this.repository.updateStatus(consultationId, 'REJECTED');
  }

  async startConsultation(consultationId: string, userId: string, userRole: string) {
    const consultation = await this.repository.findConsultationById(consultationId);
    if (!consultation) {
      throw new NotFoundError(`Teleconsultation with ID '${consultationId}' not found`, 'TELECONSULTATION_NOT_FOUND');
    }

    this.verifyStaffOrDoctorAccess(consultation, userId, userRole);

    if (consultation.status !== 'ACCEPTED') {
      throw new BadRequestError(`Consultation must be ACCEPTED before starting. Current status: '${consultation.status}'`, 'INVALID_CONSULTATION_STATUS');
    }

    return this.repository.updateStatus(consultationId, 'ACTIVE', { startedAt: new Date() });
  }

  async endConsultation(consultationId: string, userId: string, userRole: string) {
    const consultation = await this.repository.findConsultationById(consultationId);
    if (!consultation) {
      throw new NotFoundError(`Teleconsultation with ID '${consultationId}' not found`, 'TELECONSULTATION_NOT_FOUND');
    }

    this.verifyStaffOrDoctorAccess(consultation, userId, userRole);

    if (consultation.status !== 'ACTIVE' && consultation.status !== 'ACCEPTED') {
      throw new BadRequestError(`Cannot end consultation in status '${consultation.status}'`, 'INVALID_CONSULTATION_STATUS');
    }

    return this.repository.updateStatus(consultationId, 'COMPLETED', { endedAt: new Date() });
  }

  async sendChatMessage(consultationId: string, senderId: string, messageText: string, userRole: string = 'USER') {
    const consultation = await this.repository.findConsultationById(consultationId);
    if (!consultation) {
      throw new NotFoundError(`Teleconsultation with ID '${consultationId}' not found`, 'TELECONSULTATION_NOT_FOUND');
    }

    this.verifyParticipantAccess(consultation, senderId, userRole);

    if (consultation.status !== 'ACTIVE' && consultation.status !== 'ACCEPTED') {
      throw new BadRequestError(`Cannot send messages in consultation status '${consultation.status}'`, 'INVALID_CONSULTATION_STATUS');
    }

    return this.repository.saveMessage({
      consultationId,
      senderId,
      message: messageText,
    });
  }

  private verifyParticipantAccess(consultation: any, userId: string, userRole: string) {
    if (userRole === 'ADMIN' || userRole === 'HOSPITAL_STAFF') return;
    if (consultation.patientId === userId || consultation.doctorId === userId) return;

    throw new ForbiddenError('You are not an authorized participant in this teleconsultation', 'TELECONSULTATION_NOT_AUTHORIZED');
  }

  private verifyStaffOrDoctorAccess(consultation: any, userId: string, userRole: string) {
    if (userRole === 'ADMIN' || userRole === 'HOSPITAL_STAFF') return;
    if (consultation.doctorId === userId) return;

    throw new ForbiddenError('Only assigned doctor or hospital staff can perform this action', 'TELECONSULTATION_NOT_AUTHORIZED');
  }

  async getAllConsultations(query: any = {}) {
    const { Teleconsultation } = require('../../models/Teleconsultation');
    return Teleconsultation.find(query).populate('patientId').populate('doctorId').populate('hospitalId').sort({ createdAt: -1 });
  }

  async updateConsultation(id: string, data: any) {
    const { Teleconsultation } = require('../../models/Teleconsultation');
    return Teleconsultation.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteConsultation(id: string) {
    const { Teleconsultation } = require('../../models/Teleconsultation');
    return Teleconsultation.findByIdAndDelete(id);
  }
}
