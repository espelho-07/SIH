import { Request, Response } from 'express';
import {
  BedSummaryModel,
  BloodInventoryModel,
  AmbulanceModel,
  EquipmentModel,
} from '../models/Resource';
import { sendSuccess, sendError } from '../utils/response';

// Bed Summary
export async function getBedSummary(req: Request, res: Response): Promise<void> {
  const facilityId = req.params.facilityId || req.query.facilityId || req.body.facilityId || 'fac_civil_01';
  let bedSummary = await BedSummaryModel.findOne({ facilityId });

  if (!bedSummary) {
    bedSummary = await BedSummaryModel.findOne();
  }

  if (!bedSummary) {
    sendError(res, 'Bed summary not found', 404);
    return;
  }

  sendSuccess(res, 'Bed summary retrieved', bedSummary.toJSON());
}

export async function updateBedStatus(req: Request, res: Response): Promise<void> {
  const facilityId = req.params.facilityId || req.body.facilityId || 'fac_civil_01';
  const { category, available } = req.body;

  let bedSummary = await BedSummaryModel.findOne({ facilityId });
  if (!bedSummary) {
    bedSummary = await BedSummaryModel.findOne();
  }

  if (!bedSummary) {
    sendError(res, 'Bed summary not found for facility', 404);
    return;
  }

  // Update specific category
  if (category && available !== undefined) {
    const cat = bedSummary.categories.find((c) => c.type.toLowerCase() === category.toLowerCase());
    if (cat) {
      cat.available = Number(available);
      cat.occupied = Math.max(0, cat.total - cat.available);
      cat.lastUpdated = new Date().toISOString();
    }
    bedSummary.totalAvailable = bedSummary.categories.reduce((sum, c) => sum + c.available, 0);
    bedSummary.totalOccupied = bedSummary.categories.reduce((sum, c) => sum + c.occupied, 0);
    bedSummary.lastUpdated = new Date().toISOString();
    await bedSummary.save();
  }

  sendSuccess(res, 'Bed status updated successfully', bedSummary.toJSON());
}

// Blood Inventory
export async function getBloodInventory(req: Request, res: Response): Promise<void> {
  const facilityId = req.query.facilityId || req.body.facilityId || 'fac_civil_01';
  let inventory = await BloodInventoryModel.findOne({ facilityId });
  if (!inventory) {
    inventory = await BloodInventoryModel.findOne();
  }

  sendSuccess(res, 'Blood inventory retrieved', inventory ? inventory.toJSON() : null);
}

// Ambulances
export async function getAmbulances(req: Request, res: Response): Promise<void> {
  const facilityId = req.query.facilityId || req.body.facilityId;
  const filter: any = {};
  if (facilityId) filter.facilityId = facilityId;

  const ambulances = await AmbulanceModel.find(filter);
  sendSuccess(res, 'Ambulance fleet status retrieved', ambulances.map((a) => a.toJSON()));
}

// Equipment
export async function getEquipment(req: Request, res: Response): Promise<void> {
  const facilityId = req.query.facilityId || req.body.facilityId;
  const filter: any = {};
  if (facilityId) filter.facilityId = facilityId;

  const equipment = await EquipmentModel.find(filter);
  sendSuccess(res, 'Medical equipment inventory retrieved', equipment.map((e) => e.toJSON()));
}
