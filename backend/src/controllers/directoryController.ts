import { Request, Response } from 'express';
import { DoctorModel } from '../models/Doctor';
import { BloodCenterModel } from '../models/BloodCenter';
import { DistrictAdminModel } from '../models/DistrictAdmin';
import { UserModel } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';

// Doctors
export async function getDoctors(req: Request, res: Response): Promise<void> {
  try {
    const { facilityId, specialty, district } = req.query;
    const filter: any = {};
    if (facilityId) filter.facilityId = facilityId;
    if (specialty) filter.specialty = specialty;
    if (district) filter.district = district;

    let doctors = await DoctorModel.find(filter);
    if (doctors.length === 0 && facilityId) {
      doctors = await DoctorModel.find();
    }
    sendSuccess(res, 'Doctors retrieved successfully', doctors.map((d) => d.toJSON()));
  } catch (err: any) {
    sendError(res, err.message || 'Failed to retrieve doctors', 500);
  }
}

export async function createDoctor(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const id = data.id || `doc_${Date.now()}`;
    const district = data.district || 'Gandhinagar';
    const facilityId = data.facilityId || 'fac_civil_01';

    const username = data.username ? String(data.username).trim() : '';
    const password = data.password ? String(data.password).trim() : '';

    if (!username || !password) {
      sendError(
        res,
        'Doctor Login Username / ID and Password credentials are strictly mandatory to register a doctor.',
        400
      );
      return;
    }

    if (password.length < 4) {
      sendError(res, 'Doctor Password must be at least 4 characters long.', 400);
      return;
    }

    // Check if username is already taken
    const existingUser = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      id: { $ne: id },
    });
    if (existingUser) {
      sendError(res, `The Doctor Username "${username}" is already taken. Please choose a unique username / ID.`, 400);
      return;
    }

    const doc = new DoctorModel({ ...data, id, district, facilityId });
    await doc.save();

    // Create / Sync UserModel login credentials in MongoDB
    const docPhone = data.phone || `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const email = data.email || `${username}@gujarat.health.gov.in`;

    let user = await UserModel.findOne({ $or: [{ id }, { username }] });
    if (!user) {
      user = new UserModel({
        id,
        name: data.name,
        username,
        email,
        phone: docPhone,
        password,
        role: 'DOCTOR',
        facilityId,
        facilityName: data.facilityName || 'Gandhinagar Civil Hospital',
        district,
        specialty: data.specialty || 'General Medicine',
        designation: data.designation || 'Medical Officer',
        qualification: data.qualification || 'MBBS, MD',
        licenseNumber: data.registrationNumber || data.licenseNumber,
      });
      await user.save();
    } else {
      user.name = data.name;
      user.username = username;
      user.password = password;
      user.specialty = data.specialty || user.specialty;
      user.facilityId = facilityId;
      user.facilityName = data.facilityName || user.facilityName;
      user.district = district;
      await user.save();
    }

    sendSuccess(res, 'Doctor registered successfully with login credentials', {
      ...doc.toJSON(),
      credentials: { username, password },
    }, 201);
  } catch (err: any) {
    sendError(res, err.message || 'Failed to create doctor', 400);
  }
}

export async function updateDoctorStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
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
    const id = String(req.params.id);
    const updateData = req.body;

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
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
    const id = String(req.params.id);

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
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
    const district = data.district || 'Gandhinagar';
    const centre = new BloodCenterModel({ ...data, id, district });
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
    const district = data.district || 'Gandhinagar';

    const username = data.username ? String(data.username).trim() : '';
    const password = data.password ? String(data.password).trim() : '';

    if (!username || !password) {
      sendError(
        res,
        'District Admin Login Username / ID and Password credentials are strictly mandatory to appoint a district admin.',
        400
      );
      return;
    }

    if (password.length < 4) {
      sendError(res, 'District Admin Password must be at least 4 characters long.', 400);
      return;
    }

    const existingUser = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
      id: { $ne: id },
    });
    if (existingUser) {
      sendError(res, `The District Admin Username "${username}" is already taken. Please choose a unique username / ID.`, 400);
      return;
    }

    const admin = new DistrictAdminModel({ ...data, id, district });
    await admin.save();

    // Create / Sync UserModel login credentials in MongoDB
    const adminPhone = data.phone || `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const email = data.email || `${username}@gujarat.health.gov.in`;

    let user = await UserModel.findOne({ $or: [{ id }, { username }] });
    if (!user) {
      user = new UserModel({
        id,
        name: data.name,
        username,
        email,
        phone: adminPhone,
        password,
        role: 'DISTRICT_ADMIN',
        district,
        designation: data.designation || 'Chief District Medical Officer (CDMO)',
      });
      await user.save();
    } else {
      user.name = data.name;
      user.username = username;
      user.password = password;
      await user.save();
    }

    sendSuccess(res, 'District admin registered successfully with login credentials', {
      ...admin.toJSON(),
      credentials: { username, password },
    }, 201);
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
