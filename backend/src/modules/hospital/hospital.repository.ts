import { Hospital, IHospital } from '../../models/Hospital';
import { Doctor } from '../../models/Doctor';
import { HospitalService } from '../../models/HospitalService';
import { HospitalMedicine } from '../../models/HospitalMedicine';
import { HospitalQuery, CreateHospitalInput, UpdateHospitalInput } from './hospital.schema';

export class HospitalRepository {
  async findAll(query: HospitalQuery) {
    const filter: any = { isActive: true };

    if (query.district) {
      filter.district = { $regex: query.district, $options: 'i' };
    }
    if (query.state) {
      filter.state = { $regex: query.state, $options: 'i' };
    }
    if (query.type) {
      filter.type = query.type;
    }
    if (query.emergency !== undefined) {
      filter.emergencyAvailable = query.emergency;
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { address: { $regex: query.search, $options: 'i' } },
        { district: { $regex: query.search, $options: 'i' } },
      ];
    }

    let candidateHospitals = await Hospital.find(filter).sort({ name: 1 }).lean();

    if (query.service) {
      const matchingServices = await HospitalService.find({
        serviceName: { $regex: query.service, $options: 'i' },
        isAvailable: true,
      }).select('hospitalId');

      const allowedHospIds = new Set(matchingServices.map((s) => s.hospitalId.toString()));
      candidateHospitals = candidateHospitals.filter((h) => allowedHospIds.has(h._id.toString()));
    }

    const hospitalIds = candidateHospitals.map((h) => h._id);

    const [allServices, allDoctors] = await Promise.all([
      HospitalService.find({ hospitalId: { $in: hospitalIds }, isAvailable: true }).lean(),
      Doctor.find({ hospitalId: { $in: hospitalIds }, isActive: true }).lean(),
    ]);

    const serviceMap = new Map<string, any[]>();
    allServices.forEach((s) => {
      const hid = s.hospitalId.toString();
      if (!serviceMap.has(hid)) serviceMap.set(hid, []);
      serviceMap.get(hid)!.push(s);
    });

    const doctorMap = new Map<string, any[]>();
    allDoctors.forEach((d) => {
      const hid = d.hospitalId.toString();
      if (!doctorMap.has(hid)) doctorMap.set(hid, []);
      doctorMap.get(hid)!.push(d);
    });

    return candidateHospitals.map((h) => ({
      id: h._id.toString(),
      name: h.name,
      type: h.type,
      address: h.address,
      district: h.district,
      state: h.state,
      pincode: h.pincode,
      latitude: h.latitude,
      longitude: h.longitude,
      phone: h.phone,
      email: h.email,
      openingTime: h.openingTime,
      closingTime: h.closingTime,
      emergencyAvailable: h.emergencyAvailable,
      isActive: h.isActive,
      services: serviceMap.get(h._id.toString()) || [],
      doctors: doctorMap.get(h._id.toString()) || [],
    }));
  }

  async findById(id: string) {
    const h = await Hospital.findById(id).lean();
    if (!h) return null;

    const [services, doctors] = await Promise.all([
      HospitalService.find({ hospitalId: h._id }).lean(),
      Doctor.find({ hospitalId: h._id }).lean(),
    ]);

    return {
      id: h._id.toString(),
      name: h.name,
      type: h.type,
      address: h.address,
      district: h.district,
      state: h.state,
      pincode: h.pincode,
      latitude: h.latitude,
      longitude: h.longitude,
      phone: h.phone,
      email: h.email,
      openingTime: h.openingTime,
      closingTime: h.closingTime,
      emergencyAvailable: h.emergencyAvailable,
      isActive: h.isActive,
      services,
      doctors,
    };
  }

  async findDetailedById(id: string) {
    const h = await Hospital.findById(id).lean();
    if (!h) return null;

    const [doctors, services, medicines] = await Promise.all([
      Doctor.find({ hospitalId: h._id, isActive: true }).lean(),
      HospitalService.find({ hospitalId: h._id }).lean(),
      HospitalMedicine.find({ hospitalId: h._id }).populate('medicineId').lean(),
    ]);

    return {
      hospital: {
        id: h._id.toString(),
        name: h.name,
        type: h.type,
        address: h.address,
        district: h.district,
        state: h.state,
        pincode: h.pincode,
        latitude: h.latitude,
        longitude: h.longitude,
        phone: h.phone,
        email: h.email,
        openingTime: h.openingTime,
        closingTime: h.closingTime,
        emergencyAvailable: h.emergencyAvailable,
        isActive: h.isActive,
      },
      doctors: doctors.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        specialization: d.specialization,
        qualification: d.qualification,
        phone: d.phone,
        consultationStart: d.consultationStart,
        consultationEnd: d.consultationEnd,
        availabilityStatus: d.availabilityStatus,
      })),
      services: services.map((s) => ({
        id: s._id.toString(),
        serviceName: s.serviceName,
        isAvailable: s.isAvailable,
        description: s.description,
      })),
      medicines: medicines.map((m: any) => ({
        id: m._id.toString(),
        medicineId: m.medicineId?._id?.toString() || m.medicineId?.toString(),
        medicine: m.medicineId || {},
        quantity: m.quantity,
        availabilityStatus: m.availabilityStatus,
        lastUpdated: m.lastUpdated,
      })),
    };
  }

  async create(data: CreateHospitalInput) {
    const created = await Hospital.create({
      ...data,
      location: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
    });
    return {
      id: created._id.toString(),
      ...data,
    };
  }

  async update(id: string, data: UpdateHospitalInput) {
    const updateData: any = { ...data };
    if (data.latitude !== undefined && data.longitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      };
    }
    const updated = await Hospital.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return null;
    return {
      id: updated._id.toString(),
      ...updated,
    };
  }

  async delete(id: string) {
    await Promise.all([
      Hospital.findByIdAndDelete(id),
      Doctor.deleteMany({ hospitalId: id }),
      HospitalService.deleteMany({ hospitalId: id }),
      HospitalMedicine.deleteMany({ hospitalId: id }),
    ]);
  }
}
