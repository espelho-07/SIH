import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { UserRole } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Support demo/mock session tokens seamlessly
    if (token.startsWith('mock_jwt_') || token.startsWith('mock_')) {
      const normalized = token.toLowerCase();
      let role: UserRole = 'PATIENT';
      let userId = 'usr_pat_01';
      let email = 'patient@sanjeevani.gov.in';

      if (normalized.includes('doctor')) {
        role = 'DOCTOR';
        userId = 'usr_doc_01';
        email = 'dr.arvind.patel@gujarat.gov.in';
      } else if (normalized.includes('asha')) {
        role = 'ASHA';
        userId = 'usr_asha_01';
        email = 'sunita.asha@gujarat.health.gov.in';
      } else if (normalized.includes('super_admin') || normalized.includes('superadmin')) {
        role = 'SUPER_ADMIN';
        userId = 'usr_admin_01';
        email = 'alok.systems@nic.in';
      } else if (normalized.includes('district')) {
        role = 'DISTRICT_ADMIN';
        userId = 'usr_dist_01';
        email = 'cdho.gandhinagar@gujarat.gov.in';
      } else if (normalized.includes('pharma')) {
        role = 'FACILITY_STAFF';
        userId = 'usr_pharma_01';
        email = 'priya.pharma@civilhospital.in';
      } else if (normalized.includes('lab')) {
        role = 'FACILITY_STAFF';
        userId = 'usr_lab_01';
        email = 'amit.lab@civilhospital.in';
      } else if (normalized.includes('clerk') || normalized.includes('reg')) {
        role = 'FACILITY_STAFF';
        userId = 'usr_clerk_01';
        email = 'rajesh.reg@civilhospital.in';
      } else if (normalized.includes('ops') || normalized.includes('operation')) {
        role = 'FACILITY_STAFF';
        userId = 'usr_ops_01';
        email = 'vikram.ops@civilhospital.in';
      }

      req.user = { userId, email, role };
      return next();
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token has expired'));
    } else if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid access token'));
    }
  }
}

export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, () => next());
}

export function authorize(...roles: (UserRole | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    const userRole = req.user.role;
    // Super admin has universal access
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    // Role hierarchy / aliases matching
    const isAuthorized =
      roles.includes(userRole) ||
      (roles.includes('ADMIN') && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN')) ||
      (roles.includes('FACILITY_STAFF') && ['FACILITY_STAFF', 'HOSPITAL_STAFF', 'ADMIN'].includes(userRole));

    if (!isAuthorized) {
      return next(
        new ForbiddenError(`Role '${userRole}' is not authorized to access this resource`)
      );
    }

    next();
  };
}
