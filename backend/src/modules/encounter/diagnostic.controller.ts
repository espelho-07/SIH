import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import { DiagnosticOrder } from '../../models/DiagnosticOrder';

export class DiagnosticController {
  getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, category, priority, search, patientId } = req.query as Record<string, string>;

      const query: any = {};
      if (status && status !== 'ALL') query.status = status;
      if (category && category !== 'ALL') query.testCategory = category;
      if (priority && priority !== 'ALL') query.priority = priority;
      if (patientId) query.patientId = patientId;

      if (search && search.trim()) {
        const term = search.trim();
        query.$or = [
          { testName: { $regex: term, $options: 'i' } },
          { patientName: { $regex: term, $options: 'i' } },
          { orderId: { $regex: term, $options: 'i' } },
        ];
      }

      const orders = await DiagnosticOrder.find(query).sort({ createdAt: -1 });
      sendSuccess(res, 'Diagnostic orders retrieved', orders);
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = String(req.params.orderId || req.params.id || '');
      const order = await DiagnosticOrder.findOne({
        $or: [
          { orderId },
          ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        ],
      });

      if (!order) {
        sendError(res, 'Diagnostic order not found', 404);
        return;
      }

      sendSuccess(res, 'Diagnostic order retrieved', order);
    } catch (error) {
      next(error);
    }
  };

  collectSample = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = String(req.params.orderId || req.params.id || '');
      const { technicianName, notes } = req.body;

      const order = await DiagnosticOrder.findOne({
        $or: [
          { orderId },
          ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        ],
      });

      if (!order) {
        sendError(res, 'Diagnostic order not found', 404);
        return;
      }

      order.status = 'SAMPLE_COLLECTED';
      order.sampleCollectedAt = new Date().toISOString();
      order.collectedBy = technicianName || 'Lab Phlebotomist';
      order.sampleBarcode = `BAR-${Math.floor(100000 + Math.random() * 900000)}`;
      if (notes) order.clinicalNotes = notes;
      await order.save();

      sendSuccess(res, 'Diagnostic sample collected', order);
    } catch (error) {
      next(error);
    }
  };

  receiveSample = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = String(req.params.orderId || req.params.id || '');
      const { technicianName } = req.body;

      const order = await DiagnosticOrder.findOne({
        $or: [
          { orderId },
          ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        ],
      });

      if (!order) {
        sendError(res, 'Diagnostic order not found', 404);
        return;
      }

      order.status = 'SAMPLE_RECEIVED';
      order.sampleReceivedAt = new Date().toISOString();
      order.receivedBy = technicianName || 'Accession Desk Tech';
      await order.save();

      sendSuccess(res, 'Diagnostic specimen accessioned', order);
    } catch (error) {
      next(error);
    }
  };

  rejectSample = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = String(req.params.orderId || req.params.id || '');
      const { reason, notes, technicianName } = req.body;

      const order = await DiagnosticOrder.findOne({
        $or: [
          { orderId },
          ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        ],
      });

      if (!order) {
        sendError(res, 'Diagnostic order not found', 404);
        return;
      }

      order.status = 'REJECTED';
      order.sampleRejectedAt = new Date().toISOString();
      order.rejectedBy = technicianName || 'Lab Technician';
      order.rejectionReason = reason || notes || 'Pre-analytical sample compromise';
      await order.save();

      sendSuccess(res, 'Specimen rejected for recollect', order);
    } catch (error) {
      next(error);
    }
  };

  startProcessing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = String(req.params.orderId || req.params.id || '');
      const { technicianName } = req.body;

      const order = await DiagnosticOrder.findOne({
        $or: [
          { orderId },
          ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        ],
      });

      if (!order) {
        sendError(res, 'Diagnostic order not found', 404);
        return;
      }

      order.status = 'PROCESSING';
      order.processingStartedAt = new Date().toISOString();
      order.processedBy = technicianName || 'Bench Automation Tech';
      await order.save();

      sendSuccess(res, 'Specimen loaded onto analyzer', order);
    } catch (error) {
      next(error);
    }
  };

  submitResult = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = String(req.params.orderId || req.params.id || '');
      const { parameters, resultSummary, technicianName } = req.body;

      const order = await DiagnosticOrder.findOne({
        $or: [
          { orderId },
          ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
        ],
      });

      if (!order) {
        sendError(res, 'Diagnostic order not found', 404);
        return;
      }

      order.status = 'COMPLETED';
      order.resultSubmittedAt = new Date().toISOString();
      order.technicianName = technicianName || 'Dr. Patel (Biochemist)';
      if (resultSummary) order.resultSummary = resultSummary;
      if (parameters) order.parameters = parameters;
      order.reportPdfUrl = `/reports/diagnostic_${order.orderId}.pdf`;
      await order.save();

      sendSuccess(res, 'Diagnostic result validated and released', order);
    } catch (error) {
      next(error);
    }
  };
}
