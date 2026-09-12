import { Patient } from '../../models/Patient';
import { AshaVisit } from '../../models/AshaVisit';
import { SyncMutation } from '../../models/SyncMutation';

export class SyncService {
  async bootstrap(ashaId: string) {
    const patients = await Patient.find({ assignedAshaId: ashaId });
    const visits = await AshaVisit.find({ ashaId });
    return {
      bootstrapTimestamp: new Date(),
      patients,
      visits,
    };
  }

  async pushMutations(ashaId: string, mutations: any[]) {
    const results = [];
    for (const m of mutations) {
      try {
        const item = new SyncMutation({
          ashaId,
          clientMutationId: m.clientMutationId || `mut_${Date.now()}_${Math.random()}`,
          entityType: m.entityType,
          action: m.action,
          payload: m.payload,
          status: 'APPLIED',
          appliedAt: new Date(),
        });
        await item.save();

        if (m.entityType === 'PATIENT' && m.action === 'CREATE') {
          await Patient.create({ ...m.payload, assignedAshaId: ashaId });
        } else if (m.entityType === 'VISIT' && m.action === 'CREATE') {
          await AshaVisit.create({ ...m.payload, ashaId });
        }

        results.push({ clientMutationId: item.clientMutationId, status: 'APPLIED' });
      } catch (err: any) {
        results.push({ clientMutationId: m.clientMutationId, status: 'FAILED', error: err.message });
      }
    }
    return { processedCount: results.length, results };
  }

  async pullDelta(ashaId: string, lastSyncTimestamp?: string) {
    const sinceDate = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0);
    const updatedPatients = await Patient.find({ assignedAshaId: ashaId, updatedAt: { $gte: sinceDate } });
    const updatedVisits = await AshaVisit.find({ ashaId, updatedAt: { $gte: sinceDate } });
    return {
      serverTimestamp: new Date(),
      patients: updatedPatients,
      visits: updatedVisits,
    };
  }

  async getSyncStatus(ashaId: string) {
    const pendingCount = await SyncMutation.countDocuments({ ashaId, status: 'PENDING' });
    const conflictCount = await SyncMutation.countDocuments({ ashaId, status: 'CONFLICT' });
    return {
      ashaId,
      pendingCount,
      conflictCount,
      lastSyncedAt: new Date(),
    };
  }

  async getConflicts(ashaId: string) {
    return SyncMutation.find({ ashaId, status: 'CONFLICT' });
  }

  async resolveConflict(id: string, resolutionStrategy: 'SERVER_WINS' | 'CLIENT_WINS') {
    return SyncMutation.findByIdAndUpdate(
      id,
      { status: 'APPLIED', conflictDetails: `Resolved via ${resolutionStrategy}` },
      { new: true }
    );
  }
}
