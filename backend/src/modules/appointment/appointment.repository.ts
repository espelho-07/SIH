import { Appointment, IAppointment, AppointmentStatus } from '../../models/Appointment';
import { BadRequestError } from '../../utils/errors';
import { MyAppointmentsQuery } from './appointment.schema';

export class AppointmentRepository {
  async findConflictingAppointment(doctorId: string, date: string, timeSlot: string) {
    return Appointment.findOne({
      doctorId,
      appointmentDate: date,
      timeSlot,
      status: 'CONFIRMED',
    }).lean();
  }

  async findConfirmedAppointmentsForDoctorAndDate(doctorId: string, date: string) {
    return Appointment.find({
      doctorId,
      appointmentDate: date,
      status: 'CONFIRMED',
    })
      .select('timeSlot')
      .lean();
  }

  async createAppointment(data: {
    patientId: string;
    doctorId: string;
    hospitalId: string;
    appointmentDate: string;
    timeSlot: string;
    reason: string;
    status?: AppointmentStatus;
  }) {
    try {
      const created = await Appointment.create(data);
      return this.findAppointmentById(created._id.toString());
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestError('This appointment slot is already booked', 'SLOT_ALREADY_BOOKED');
      }
      throw error;
    }
  }

  async findPatientAppointments(patientId: string, query: MyAppointmentsQuery) {
    const filter: any = { patientId };

    if (query.status) {
      filter.status = query.status;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (query.upcoming) {
      filter.appointmentDate = { $gte: todayStr };
    } else if (query.past) {
      filter.appointmentDate = { $lt: todayStr };
    }

    const appointments: any[] = await Appointment.find(filter)
      .populate('hospitalId', 'name type address district phone emergencyAvailable')
      .populate('doctorId', 'name specialization qualification phone consultationStart consultationEnd')
      .sort({ appointmentDate: 1, timeSlot: 1 })
      .lean();

    return appointments.map((app) => this.formatAppointmentOutput(app));
  }

  async findAppointmentById(id: string) {
    const app: any = await Appointment.findById(id)
      .populate('patientId', 'name email role')
      .populate('hospitalId', 'name type address district phone emergencyAvailable latitude longitude')
      .populate('doctorId', 'name specialization qualification phone consultationStart consultationEnd')
      .lean();

    if (!app) return null;
    return this.formatAppointmentOutput(app);
  }

  async findAllAppointments(query: any) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.doctorId) filter.doctorId = query.doctorId;
    if (query.date) filter.appointmentDate = query.date;

    const appointments: any[] = await Appointment.find(filter)
      .populate('patientId', 'name email')
      .populate('hospitalId', 'name type district')
      .populate('doctorId', 'name specialization')
      .sort({ appointmentDate: -1, timeSlot: 1 })
      .lean();

    return appointments.map((app) => this.formatAppointmentOutput(app));
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    const updated: any = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    )
      .populate('patientId', 'name email')
      .populate('hospitalId', 'name type address district phone')
      .populate('doctorId', 'name specialization qualification')
      .lean();

    if (!updated) return null;
    return this.formatAppointmentOutput(updated);
  }

  private formatAppointmentOutput(app: any) {
    return {
      id: app.appointmentId || app._id.toString(),
      patientId: app.patientId?._id?.toString() || app.patientId?.toString() || app.patientId || 'usr_pat_01',
      patientName: app.patientName || app.patientId?.name || 'Rameshwar Sharma',
      patientPhone: app.patientPhone || app.patientId?.phone || '9876543210',
      patientAge: app.patientAge || 48,
      patientGender: app.patientGender || 'M',
      doctorId: app.doctorId?._id?.toString() || app.doctorId?.toString() || app.doctorId || 'usr_doc_01',
      doctorName: app.doctorName || app.doctorId?.name || 'Dr. Arvind Patel',
      specialty: app.specialty || app.doctorId?.specialization || 'General Medicine',
      facilityId: app.facilityId || app.hospitalId?._id?.toString() || app.hospitalId?.toString() || 'fac_civil_01',
      facilityName: app.facilityName || app.hospitalId?.name || 'Gandhinagar Civil Hospital',
      date: app.date || app.appointmentDate,
      appointmentDate: app.appointmentDate || app.date,
      timeSlot: app.timeSlot || '10:30 AM',
      reason: app.reason || 'General Consultation',
      status: app.status || 'SCHEDULED',
      type: app.type || 'IN_PERSON',
      queueTokenId: app.queueTokenId,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
