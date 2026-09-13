import mongoose from 'mongoose';
import { Doctor } from '../../models/Doctor';
import { DoctorQuery, CreateDoctorInput, UpdateDoctorInput } from './doctor.schema';

export class DoctorRepository {
  async findAll(query: DoctorQuery) {
    const filter: any = { isActive: true };

    if (query.specialization) {
      filter.specialization = { $regex: query.specialization, $options: 'i' };
    }
    if (query.hospitalId) {
      if (mongoose.Types.ObjectId.isValid(query.hospitalId)) {
        filter.hospitalId = new mongoose.Types.ObjectId(query.hospitalId);
      } else {
        filter.hospitalId = query.hospitalId;
      }
    }
    if (query.availabilityStatus) {
      filter.availabilityStatus = query.availabilityStatus;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { specialization: { $regex: query.search, $options: 'i' } },
        { qualification: { $regex: query.search, $options: 'i' } },
      ];
    }

    const doctors = await Doctor.find(filter).populate('hospitalId').sort({ name: 1 }).lean();

    return doctors.map((d: any) => ({
      id: d._id.toString(),
      hospitalId: d.hospitalId?._id?.toString() || d.hospitalId?.toString(),
      hospital: d.hospitalId
        ? {
            id: d.hospitalId._id.toString(),
            name: d.hospitalId.name,
            type: d.hospitalId.type,
            address: d.hospitalId.address,
            district: d.hospitalId.district,
            emergencyAvailable: d.hospitalId.emergencyAvailable,
          }
        : null,
      name: d.name,
      specialization: d.specialization,
      qualification: d.qualification,
      phone: d.phone,
      consultationStart: d.consultationStart,
      consultationEnd: d.consultationEnd,
      availabilityStatus: d.availabilityStatus,
      isActive: d.isActive,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async findById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const d: any = await Doctor.findById(id).populate('hospitalId').lean();
    if (!d) return null;

    return {
      id: d._id.toString(),
      hospitalId: d.hospitalId?._id?.toString() || d.hospitalId?.toString(),
      hospital: d.hospitalId || null,
      name: d.name,
      specialization: d.specialization,
      qualification: d.qualification,
      phone: d.phone,
      consultationStart: d.consultationStart,
      consultationEnd: d.consultationEnd,
      availabilityStatus: d.availabilityStatus,
      isActive: d.isActive,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async create(data: CreateDoctorInput) {
    const created = await Doctor.create(data);
    return this.findById(created._id.toString());
  }

  async update(id: string, data: UpdateDoctorInput) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await Doctor.findByIdAndUpdate(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return;
    await Doctor.findByIdAndDelete(id);
  }
}
