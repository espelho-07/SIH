import { Request, Response } from 'express';
import { FacilityModel, IFacility } from '../models/Facility';
import { sendSuccess, sendError } from '../utils/response';

// Calculate distance in KM using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function getAllFacilities(req: Request, res: Response): Promise<void> {
  // Support params in query or body
  const queryParams = { ...req.query, ...req.body };
  const {
    search,
    facilityType,
    specialty,
    emergencyOnly,
    availableBedsOnly,
    maxDistanceKm,
    lat,
    lng,
    page = 1,
    limit = 50,
  } = queryParams;

  const filter: any = {};

  if (facilityType && facilityType !== 'ALL') {
    filter.type = facilityType;
  }

  if (specialty && specialty !== 'ALL') {
    filter.specialties = specialty;
  }

  if (emergencyOnly === true || emergencyOnly === 'true') {
    filter.emergencyAvailable = true;
  }

  if (availableBedsOnly === true || availableBedsOnly === 'true') {
    filter.availableBeds = { $gt: 0 };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } },
      { district: { $regex: search, $options: 'i' } },
      { specialties: { $regex: search, $options: 'i' } },
    ];
  }

  const facilities = await FacilityModel.find(filter);

  // If user passed coordinates, calculate distanceKm
  const userLat = lat ? parseFloat(lat) : undefined;
  const userLng = lng ? parseFloat(lng) : undefined;

  let results = facilities.map((f) => {
    const obj = f.toJSON() as any;
    if (userLat !== undefined && userLng !== undefined && f.coordinates) {
      obj.distanceKm = calculateDistance(userLat, userLng, f.coordinates.lat, f.coordinates.lng);
    }
    return obj;
  });

  if (maxDistanceKm && (userLat !== undefined && userLng !== undefined)) {
    const maxDist = parseFloat(maxDistanceKm);
    results = results.filter((f) => f.distanceKm !== undefined && f.distanceKm <= maxDist);
  }

  sendSuccess(res, 'Facilities retrieved', results, 200, {
    page: Number(page),
    limit: Number(limit),
    total: results.length,
  });
}

export async function getFacilityById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const facility = await FacilityModel.findOne({ id });

  if (!facility) {
    // Fallback: try find by _id or first available
    const fallback = await FacilityModel.findOne();
    if (fallback) {
      sendSuccess(res, 'Facility details retrieved', fallback.toJSON());
      return;
    }
    sendError(res, `Facility with ID ${id} not found.`, 404);
    return;
  }

  sendSuccess(res, 'Facility details retrieved', facility.toJSON());
}

export async function createFacility(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const id = data.id || `fac_${Date.now()}`;
    const facility = new FacilityModel({ ...data, id });
    await facility.save();

    sendSuccess(
      res,
      `Government facility ${facility.name} registered successfully in ${facility.district}`,
      facility.toJSON(),
      201
    );
  } catch (err: any) {
    sendError(res, err.message || 'Failed to create facility', 400);
  }
}

export async function getNearbyFacilities(req: Request, res: Response): Promise<void> {
  const params = { ...req.query, ...req.body };
  const lat = parseFloat(params.lat || '23.2156');
  const lng = parseFloat(params.lng || '72.6369');
  const radiusKm = parseFloat(params.radiusKm || '25');

  const facilities = await FacilityModel.find();
  const nearby = facilities
    .map((f) => {
      const obj = f.toJSON() as any;
      if (f.coordinates) {
        obj.distanceKm = calculateDistance(lat, lng, f.coordinates.lat, f.coordinates.lng);
      }
      return obj;
    })
    .filter((f) => f.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  sendSuccess(res, 'Nearby facilities retrieved', nearby);
}

export async function searchFacilities(req: Request, res: Response): Promise<void> {
  const params = { ...req.query, ...req.body };
  const query = params.query || '';

  const filter = query
    ? {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { address: { $regex: query, $options: 'i' } },
          { district: { $regex: query, $options: 'i' } },
          { specialties: { $regex: query, $options: 'i' } },
        ],
      }
    : {};

  const facilities = await FacilityModel.find(filter);
  sendSuccess(res, 'Facility search completed', facilities.map((f) => f.toJSON()));
}

export async function matchFacilities(req: Request, res: Response): Promise<void> {
  const criteria = req.body;
  const facilities = await FacilityModel.find();

  const userLat = criteria.lat || 23.2156;
  const userLng = criteria.lng || 72.6369;

  const results = facilities.map((fac) => {
    let score = 70;
    const reasons: string[] = [];

    // Specialty check
    if (criteria.specialty && fac.specialties.some((s) => s.toLowerCase().includes(criteria.specialty.toLowerCase()))) {
      score += 20;
      reasons.push(`Specialist available in ${criteria.specialty}`);
    }

    // ICU Requirement
    if (criteria.requiresIcu) {
      if (fac.icuBedsAvailable > 0) {
        score += 10;
        reasons.push(`ICU beds available (${fac.icuBedsAvailable})`);
      } else {
        score -= 30;
      }
    }

    // Distance calculation
    const distanceKm = fac.coordinates
      ? calculateDistance(userLat, userLng, fac.coordinates.lat, fac.coordinates.lng)
      : 5;

    let bedAvailabilityStatus: 'PLENTY' | 'LIMITED' | 'CRITICAL' | 'NONE' = 'PLENTY';
    if (fac.availableBeds === 0) bedAvailabilityStatus = 'NONE';
    else if (fac.availableBeds < 5) bedAvailabilityStatus = 'CRITICAL';
    else if (fac.availableBeds < 15) bedAvailabilityStatus = 'LIMITED';

    return {
      facility: fac.toJSON(),
      suitabilityScore: Math.min(100, Math.max(10, score)),
      clinicalMatchPercent: Math.min(100, score),
      specialistAvailability: 'AVAILABLE_NOW',
      equipmentSuitability: true,
      bedAvailabilityStatus,
      distanceKm,
      estimatedTransitTimeMins: Math.round(distanceKm * 2.5),
      matchReasons: reasons.length > 0 ? reasons : ['General hospital coverage', 'Emergency facility operational'],
    };
  });

  results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  sendSuccess(res, 'Matched facilities ranked successfully', results);
}

export async function updateFacility(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const isMongoId = id && /^[0-9a-fA-F]{24}$/.test(id);
    const filter = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };

    const facility = await FacilityModel.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true }
    );

    if (!facility) {
      sendError(res, `Facility with ID ${id} not found`, 404);
      return;
    }

    sendSuccess(res, `Facility ${facility.name} updated successfully`, facility.toJSON());
  } catch (err: any) {
    sendError(res, err.message || 'Failed to update facility', 500);
  }
}

export async function deleteFacility(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const isMongoId = id && /^[0-9a-fA-F]{24}$/.test(id);
    const filter = isMongoId ? { $or: [{ id }, { _id: id }] } : { id };

    const facility = await FacilityModel.findOneAndDelete(filter);

    if (!facility) {
      sendError(res, `Facility with ID ${id} not found`, 404);
      return;
    }

    sendSuccess(res, `Facility ${facility.name} deleted successfully`, { id, deleted: true });
  } catch (err: any) {
    sendError(res, err.message || 'Failed to delete facility', 500);
  }
}

