import { Ambulance, AmbulanceRequest } from '../../models/Ambulance';

export class AmbulanceService {
  async getAmbulances(query: any) {
    const filter: any = {};
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    return Ambulance.find(filter).populate('hospitalId');
  }

  async getAmbulanceById(id: string) {
    return Ambulance.findById(id).populate('hospitalId');
  }

  async createAmbulance(data: any) {
    const ambulance = new Ambulance(data);
    await ambulance.save();
    return ambulance;
  }

  async updateAmbulance(id: string, data: any) {
    return Ambulance.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteAmbulance(id: string) {
    return Ambulance.findByIdAndDelete(id);
  }

  async updateStatus(id: string, status: string) {
    return Ambulance.findByIdAndUpdate(id, { status }, { new: true });
  }

  async updateLocation(id: string, latitude: number, longitude: number) {
    return Ambulance.findByIdAndUpdate(
      id,
      { currentLocation: { latitude, longitude, lastUpdated: new Date() } },
      { new: true }
    );
  }

  async getLocation(id: string) {
    const amb = await Ambulance.findById(id).select('vehicleNumber currentLocation status');
    return amb?.currentLocation;
  }

  // Emergency Requests
  async createRequest(data: any) {
    const req = new AmbulanceRequest(data);
    await req.save();
    return req;
  }

  async getRequests(query: any) {
    const filter: any = {};
    if (query.status) filter.status = query.status;
    return AmbulanceRequest.find(filter)
      .populate('patientId')
      .populate('assignedAmbulanceId')
      .populate('destinationHospitalId')
      .sort({ requestedAt: -1 });
  }

  async getRequestById(id: string) {
    return AmbulanceRequest.findById(id)
      .populate('patientId')
      .populate('assignedAmbulanceId')
      .populate('destinationHospitalId');
  }

  async assignRequest(requestId: string, ambulanceId: string) {
    const req = await AmbulanceRequest.findByIdAndUpdate(
      requestId,
      { assignedAmbulanceId: ambulanceId, status: 'ASSIGNED' },
      { new: true }
    );
    await Ambulance.findByIdAndUpdate(ambulanceId, { status: 'ON_DISPATCH' });
    return req;
  }

  async updateRequestStatus(requestId: string, status: string) {
    const update: any = { status };
    if (status === 'COMPLETED') update.completedAt = new Date();
    const req = await AmbulanceRequest.findByIdAndUpdate(requestId, update, { new: true });
    if (status === 'COMPLETED' && req?.assignedAmbulanceId) {
      await Ambulance.findByIdAndUpdate(req.assignedAmbulanceId, { status: 'AVAILABLE' });
    }
    return req;
  }
}
