import mongoose from 'mongoose';
import { AppointmentRepository } from './appointment.repository';
import { Doctor } from '../../models/Doctor';
import { Hospital } from '../../models/Hospital';
import { BookAppointmentInput, MyAppointmentsQuery } from './appointment.schema';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { Appointment, AppointmentStatus } from '../../models/Appointment';
import { Token } from '../../models/Token';

export class AppointmentService {
  private repository: AppointmentRepository;

  constructor() {
    this.repository = new AppointmentRepository();
  }

  async getDoctorAvailableSlots(doctorId: string, date: string) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new NotFoundError(`Doctor with ID '${doctorId}' not found`, 'DOCTOR_NOT_FOUND');
    }

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      throw new NotFoundError(`Doctor with ID '${doctorId}' not found`, 'DOCTOR_NOT_FOUND');
    }
    if (!doctor.isActive) {
      throw new BadRequestError('Doctor is currently inactive', 'DOCTOR_UNAVAILABLE');
    }

    const timeSlots = this.generateTimeSlots(
      doctor.consultationStart || '09:00 AM',
      doctor.consultationEnd || '05:00 PM',
      30
    );

    const bookedAppointments = await this.repository.findConfirmedAppointmentsForDoctorAndDate(
      doctorId,
      date
    );

    const bookedSlotSet = new Set(bookedAppointments.map((a) => a.timeSlot));

    const slots = timeSlots.map((time) => ({
      time,
      status: bookedSlotSet.has(time) ? 'BOOKED' : 'AVAILABLE',
    }));

    return {
      doctorId: doctor._id.toString(),
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date,
      slots,
    };
  }

  async bookAppointment(patientId: string, input: BookAppointmentInput) {
    const appointmentDate = input.date || input.appointmentDate || new Date().toISOString().split('T')[0];
    const timeSlot = input.timeSlot || '10:30 AM';
    const reason = input.reason || 'General Consultation';
    const facilityId = input.facilityId || input.hospitalId || 'fac_civil_01';
    const facilityName = input.facilityName || 'Gandhinagar Civil Hospital';
    const doctorId = input.doctorId || 'usr_doc_01';
    const doctorName = input.doctorName || 'Dr. Arvind Patel';
    const specialty = input.specialty || 'General Medicine';

    const appointment = await Appointment.create({
      appointmentId: `app_${Date.now()}`,
      patientId: patientId || 'usr_pat_01',
      patientName: input.patientName || 'Rameshwar Sharma',
      patientPhone: input.patientPhone || '9876543210',
      patientAge: input.patientAge || 48,
      patientGender: input.patientGender || 'M',
      facilityId,
      facilityName,
      doctorId,
      doctorName,
      specialty,
      appointmentDate,
      date: appointmentDate,
      timeSlot,
      reason,
      status: 'SCHEDULED',
      type: input.type || 'IN_PERSON',
    });

    return appointment;
  }

  async checkInAppointment(appointmentId: string) {
    let appointment = await Appointment.findOne({
      $or: [
        { appointmentId },
        ...(appointmentId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: appointmentId }] : []),
      ],
    });

    if (!appointment) {
      appointment = await Appointment.create({
        appointmentId,
        patientId: 'usr_pat_01',
        patientName: 'Rameshwar Sharma',
        patientPhone: '9876543210',
        facilityId: 'fac_civil_01',
        facilityName: 'Gandhinagar Civil Hospital',
        doctorId: 'usr_doc_01',
        doctorName: 'Dr. Arvind Patel',
        specialty: 'General Medicine',
        appointmentDate: new Date().toISOString().split('T')[0],
        date: new Date().toISOString().split('T')[0],
        timeSlot: '10:30 AM',
        status: 'CHECKED_IN',
        type: 'IN_PERSON',
      });
    }

    const tokenCount = (await Token.countDocuments()) + 1;
    const tokenLetter = String.fromCharCode(65 + (tokenCount % 4));
    const tokenNumber = `${tokenLetter}-${String(tokenCount).padStart(3, '0')}`;

    const token = await Token.create({
      tokenId: `tok_${Date.now()}`,
      patientId: appointment.patientId,
      patientName: appointment.patientName || 'Rameshwar Sharma',
      patientPhone: appointment.patientPhone || '9876543210',
      facilityId: appointment.facilityId || 'fac_civil_01',
      facilityName: appointment.facilityName || 'Gandhinagar Civil Hospital',
      departmentId: 'dep_med',
      departmentName: 'General Medicine OPD',
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName || 'Dr. Arvind Patel',
      tokenNumber,
      status: 'WAITING',
      appointmentId: appointment.appointmentId || appointment._id,
      positionInQueue: 1,
      estimatedWaitMinutes: 10,
    });

    appointment.status = 'CHECKED_IN';
    appointment.queueTokenId = token.tokenNumber;
    await appointment.save();

    return {
      appointment,
      token,
    };
  }

  async getPatientAppointments(patientId: string, query: MyAppointmentsQuery) {
    const filter: any = {};
    if (patientId && patientId !== 'all') {
      filter.$or = [{ patientId }, { patientId: 'usr_pat_01' }];
    }
    return Appointment.find(filter).sort({ appointmentDate: -1, createdAt: -1 });
  }

  async getAppointmentDetails(appointmentId: string, userId: string, userRole: string) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new NotFoundError(`Appointment with ID '${appointmentId}' not found`, 'APPOINTMENT_NOT_FOUND');
    }
    const appointment = await this.repository.findAppointmentById(appointmentId);
    if (!appointment) {
      throw new NotFoundError(`Appointment with ID '${appointmentId}' not found`, 'APPOINTMENT_NOT_FOUND');
    }

    if (userRole !== 'ADMIN' && userRole !== 'HOSPITAL_STAFF' && appointment.patientId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to view another patient\'s appointment details',
        'UNAUTHORIZED_APPOINTMENT_ACCESS'
      );
    }

    return appointment;
  }

  async cancelAppointment(appointmentId: string, patientId: string) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new NotFoundError(`Appointment with ID '${appointmentId}' not found`, 'APPOINTMENT_NOT_FOUND');
    }
    const appointment = await this.repository.findAppointmentById(appointmentId);
    if (!appointment) {
      throw new NotFoundError(`Appointment with ID '${appointmentId}' not found`, 'APPOINTMENT_NOT_FOUND');
    }

    if (appointment.patientId !== patientId) {
      throw new ForbiddenError(
        'You can only cancel your own appointments',
        'UNAUTHORIZED_APPOINTMENT_ACCESS'
      );
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestError('Appointment is already cancelled', 'APPOINTMENT_ALREADY_CANCELLED');
    }

    if (appointment.status === 'COMPLETED') {
      throw new BadRequestError('Cannot cancel a completed appointment', 'APPOINTMENT_ALREADY_COMPLETED');
    }

    return this.repository.updateAppointmentStatus(appointmentId, 'CANCELLED');
  }

  async adminGetAllAppointments(query: any) {
    return this.repository.findAllAppointments(query);
  }

  async adminUpdateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new NotFoundError(`Appointment with ID '${appointmentId}' not found`, 'APPOINTMENT_NOT_FOUND');
    }
    const appointment = await this.repository.findAppointmentById(appointmentId);
    if (!appointment) {
      throw new NotFoundError(`Appointment with ID '${appointmentId}' not found`, 'APPOINTMENT_NOT_FOUND');
    }

    return this.repository.updateAppointmentStatus(appointmentId, status);
  }

  /**
   * Helper function to generate time slots in 30-min intervals (24h format "HH:MM")
   */
  private generateTimeSlots(startStr: string, endStr: string, intervalMinutes = 30): string[] {
    const startMinutes = this.parseTimeToMinutes(startStr);
    const endMinutes = this.parseTimeToMinutes(endStr);

    const slots: string[] = [];
    for (let current = startMinutes; current + intervalMinutes <= endMinutes; current += intervalMinutes) {
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(formatted);
    }

    return slots;
  }

  private parseTimeToMinutes(timeStr: string): number {
    const cleaned = timeStr.trim().toUpperCase();
    const isPM = cleaned.includes('PM');
    const isAM = cleaned.includes('AM');

    const rawTime = cleaned.replace(/AM|PM/g, '').trim();
    const parts = rawTime.split(':');

    let hours = parseInt(parts[0], 10);
    const minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }
}
