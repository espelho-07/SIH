import mongoose from 'mongoose';
import { Teleconsultation, ITeleconsultation, TeleconsultationStatus } from '../../models/Teleconsultation';
import { Message, IMessage } from '../../models/Message';

export class TeleconsultationRepository {
  async createTeleconsultation(data: {
    patientId: string;
    doctorId: string;
    hospitalId: string;
    appointmentId?: string;
    reason: string;
  }) {
    const created = await Teleconsultation.create({
      ...data,
      status: 'REQUESTED',
    });
    return this.findConsultationById(created._id.toString());
  }

  async findPatientConsultations(patientId: string, query: any) {
    const filter: any = { patientId };
    if (query.status) filter.status = query.status;
    if (query.active) filter.status = { $in: ['ACCEPTED', 'ACTIVE'] };
    if (query.completed) filter.status = 'COMPLETED';

    const list: any[] = await Teleconsultation.find(filter)
      .populate('hospitalId', 'name type address district phone')
      .populate('doctorId', 'name specialization qualification phone')
      .sort({ createdAt: -1 })
      .lean();

    return list.map((c) => this.formatConsultation(c));
  }

  async findDoctorConsultations(doctorId: string, query: any) {
    const filter: any = { doctorId };
    if (query.status) filter.status = query.status;

    const list: any[] = await Teleconsultation.find(filter)
      .populate('patientId', 'name email phone')
      .populate('hospitalId', 'name type district')
      .sort({ createdAt: -1 })
      .lean();

    return list.map((c) => this.formatConsultation(c));
  }

  async findConsultationById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const c: any = await Teleconsultation.findById(id)
      .populate('patientId', 'name email phone role')
      .populate('hospitalId', 'name type address district phone emergencyAvailable')
      .populate('doctorId', 'name specialization qualification phone')
      .populate('appointmentId')
      .lean();

    if (!c) return null;
    return this.formatConsultation(c);
  }

  async updateStatus(id: string, status: TeleconsultationStatus, updateData: any = {}) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const payload: any = { status, ...updateData };
    if (status === 'ACTIVE' && !payload.startedAt) payload.startedAt = new Date();
    if (status === 'COMPLETED' && !payload.endedAt) payload.endedAt = new Date();

    const updated = await Teleconsultation.findByIdAndUpdate(id, payload, { returnDocument: 'after' }).lean();
    if (!updated) return null;
    return this.findConsultationById(id);
  }

  async saveMessage(data: {
    consultationId: string;
    senderId: string;
    receiverId?: string;
    message: string;
  }) {
    const created: any = await Message.create({
      consultationId: data.consultationId,
      senderId: data.senderId,
      receiverId: data.receiverId || undefined,
      message: data.message,
      messageType: 'TEXT',
    });

    const populated: any = await Message.findById(created._id)
      .populate('senderId', 'name email role')
      .lean();

    return {
      id: populated._id.toString(),
      consultationId: populated.consultationId.toString(),
      senderId: populated.senderId?._id?.toString() || populated.senderId?.toString(),
      sender: populated.senderId,
      message: populated.message,
      messageType: populated.messageType,
      createdAt: populated.createdAt,
    };
  }

  async getConsultationMessages(consultationId: string) {
    if (!mongoose.Types.ObjectId.isValid(consultationId)) return [];

    const messages: any[] = await Message.find({ consultationId })
      .populate('senderId', 'name email role')
      .sort({ createdAt: 1 })
      .lean();

    return messages.map((m) => ({
      id: m._id.toString(),
      consultationId: m.consultationId.toString(),
      senderId: m.senderId?._id?.toString() || m.senderId?.toString(),
      sender: m.senderId,
      message: m.message,
      messageType: m.messageType,
      createdAt: m.createdAt,
    }));
  }

  private formatConsultation(c: any) {
    return {
      id: c._id.toString(),
      patientId: c.patientId?._id?.toString() || c.patientId?.toString() || c.patientId,
      patient: c.patientId && typeof c.patientId === 'object' ? c.patientId : null,
      doctorId: c.doctorId?._id?.toString() || c.doctorId?.toString() || c.doctorId,
      doctor: c.doctorId && typeof c.doctorId === 'object' ? c.doctorId : null,
      hospitalId: c.hospitalId?._id?.toString() || c.hospitalId?.toString() || c.hospitalId,
      hospital: c.hospitalId && typeof c.hospitalId === 'object' ? c.hospitalId : null,
      appointmentId: c.appointmentId?._id?.toString() || c.appointmentId?.toString() || c.appointmentId || null,
      reason: c.reason,
      status: c.status,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
