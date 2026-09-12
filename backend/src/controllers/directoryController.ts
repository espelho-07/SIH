import { Request, Response } from 'express';
import { DoctorModel } from '../models/Doctor';
import { BloodCenterModel } from '../models/BloodCenter';
import { DistrictAdminModel } from '../models/DistrictAdmin';
import { sendSuccess, sendError } from '../utils/response';

// Doctors
export async function getDoctors(req: Request, res: Response): Promise<void> {
  try {
    const { facilityId, specialty, district } = req.query;
    const filter: any = {};
    if (facilityId) filter.facilityId = facilityId;
    if (specialty) filter.specialty = specialty;
    if (district) filter.district = district;

    const doctors = await DoctorModel.find(filter);
    sendSuccess(res, 'Doctors retrieved successfully', doctors.map((d) => d.toJSON()));
  } catch (err: any) {
    sendError(res, err.message || 'Failed to retrieve doctors', 500);
  }
}

export async function createDoctor(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const id = data.id || `doc_${Date.now()}`;
    const doc = new DoctorModel({ ...data, id });
    await doc.save();
    sendSuccess(res, 'Doctor registered successfully', doc.toJSON(), 201);
  } catch (err: any) {
    sendError(res, err.message || 'Failed to create doctor', 400);
  }
}

export async function updateDoctorStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const isMongoId = id && /^[0-9a-fA-F]{24}$/.test(id);
    const filter = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };

    const doc = await DoctorModel.findOneAndUpdate(filter, { status }, { new: true });
    if (!doc) {
      sendError(res, `Doctor ${id} not found`, 404);
      return;
    }
    sendSuccess(res, `Doctor status updated to ${status}`, doc.toJSON());
  } catch (err: any) {
    sendError(res, err.message || 'Failed to update doctor status', 400);
  }
}

export async function updateDoctor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const isMongoId = id && /^[0-9a-fA-F]{24}$/.test(id);
    const filter = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };

    const doc = await DoctorModel.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true }
    );

    if (!doc) {
      sendError(res, `Doctor ${id} not found`, 404);
      return;
    }

    sendSuccess(res, `Doctor ${doc.name} profile updated successfully`, doc.toJSON());
  } catch (err: any) {
    sendError(res, err.message || 'Failed to update doctor', 500);
  }
}

export async function deleteDoctor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const isMongoId = id && /^[0-9a-fA-F]{24}$/.test(id);
    const filter = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };

    const doc = await DoctorModel.findOneAndDelete(filter);

    if (!doc) {
      sendError(res, `Doctor ${id} not found`, 404);
      return;
    }

    sendSuccess(res, `Doctor ${doc.name} deleted successfully from duty roster`, { id, deleted: true });
  } catch (err: any) {
    sendError(res, err.message || 'Failed to delete doctor', 500);
  }
}

// Blood Centres
export async function getBloodCentres(req: Request, res: Response): Promise<void> {
  try {
    const { district } = req.query;
    const filter: any = {};
    if (district) filter.district = district;

    const centres = await BloodCenterModel.find(filter);
    sendSuccess(res, 'Blood centres retrieved successfully', centres.map((c) => c.toJSON()));
  } catch (err: any) {
    sendError(res, err.message || 'Failed to retrieve blood centres', 500);
  }
}

export async function createBloodCentre(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const id = data.id || `bc_${Date.now()}`;
    const centre = new BloodCenterModel({ ...data, id });
    await centre.save();
    sendSuccess(res, 'Blood centre added successfully', centre.toJSON(), 201);
  } catch (err: any) {
    sendError(res, err.message || 'Failed to add blood centre', 400);
  }
}

// District Admins
export async function getDistrictAdmins(req: Request, res: Response): Promise<void> {
  try {
    const { district } = req.query;
    const filter: any = {};
    if (district) filter.district = district;

    const admins = await DistrictAdminModel.find(filter);
    sendSuccess(res, 'District admins retrieved successfully', admins.map((a) => a.toJSON()));
  } catch (err: any) {
    sendError(res, err.message || 'Failed to retrieve district admins', 500);
  }
}

export async function createDistrictAdmin(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const id = data.id || `usr_dist_${Date.now()}`;
    const admin = new DistrictAdminModel({ ...data, id });
    await admin.save();
    sendSuccess(res, 'District admin registered successfully', admin.toJSON(), 201);
  } catch (err: any) {
    sendError(res, err.message || 'Failed to create district admin', 400);
  }
}

export async function updateDistrictAdminStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const admin = await DistrictAdminModel.findOneAndUpdate({ id }, { status }, { new: true });
    if (!admin) {
      sendError(res, `District admin ${id} not found`, 404);
      return;
    }
    sendSuccess(res, `District admin status updated to ${status}`, admin.toJSON());
  } catch (err: any) {
    sendError(res, err.message || 'Failed to update district admin status', 400);
  }
}
