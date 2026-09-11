import { mockState } from './db';
import { ApiResponse } from '@/types/api';
import { User, UserRole, StaffSubType } from '@/types/auth';
import { FacilityMatchRequest } from '@/types/facility';
import { CreateReferralRequest } from '@/types/referral';
import { AshaPatient, AshaVisit, ScreeningSession, FollowUpTask, FrontlineReferral } from '@/types/asha';

// Intercepts mock requests and returns structured ApiResponse format
export async function handleMockRequest(url: string, method: string = 'GET', data?: unknown): Promise<ApiResponse<unknown> | null> {
  // Artificial slight latency to demonstrate smooth loading skeletons (120ms)
  await new Promise((r) => setTimeout(r, 120));

  const cleanUrl = url.replace(/^[a-z]+:\/\/[^/]+/i, '').split('?')[0];

  // 1. AUTH
  if (cleanUrl.includes('/auth/patient/send-otp') && method === 'POST') {
    return {
      success: true,
      message: 'OTP sent successfully to registered mobile number (Demo OTP: 123456)',
      data: { phone: (data as { phone: string })?.phone || '9876543210' },
    };
  }

  if (cleanUrl.includes('/auth/patient/verify-otp') && method === 'POST') {
    const user = mockState.users.patient;
    return {
      success: true,
      message: 'OTP verified successfully',
      data: {
        user,
        tokens: { accessToken: 'mock_jwt_patient', refreshToken: 'mock_refresh_patient', expiresIn: 3600 },
      },
    };
  }

  if (cleanUrl.includes('/auth/login') && method === 'POST') {
    const creds = (data || {}) as { role?: UserRole; staffSubType?: StaffSubType; identifier?: string };
    let user = mockState.users.patient;

    if (creds.role === 'ASHA') user = mockState.users.asha;
    else if (creds.role === 'DOCTOR') user = mockState.users.doctor;
    else if (creds.role === 'FACILITY_STAFF') {
      if (creds.staffSubType === 'PHARMACIST') user = mockState.users.pharmacist;
      else if (creds.staffSubType === 'LAB_TECHNICIAN') user = mockState.users.labTech;
      else if (creds.staffSubType === 'FACILITY_OPERATIONS') user = mockState.users.operations;
      else user = mockState.users.registrationClerk;
    } else if (creds.role === 'DISTRICT_ADMIN') user = mockState.users.districtAdmin;
    else if (creds.role === 'SUPER_ADMIN') user = mockState.users.superAdmin;

    return {
      success: true,
      message: 'Authentication successful',
      data: {
        user,
        tokens: { accessToken: `mock_jwt_${user.role.toLowerCase()}`, refreshToken: 'mock_refresh_token', expiresIn: 3600 },
      },
    };
  }

  if (cleanUrl.includes('/auth/me')) {
    return {
      success: true,
      message: 'Current authenticated user retrieved',
      data: mockState.users.patient,
    };
  }

  // 2. FACILITIES
  if (cleanUrl === '/api/v1/facilities' || cleanUrl.includes('/facilities/nearby') || cleanUrl.includes('/facilities/search')) {
    return {
      success: true,
      message: 'Facilities retrieved',
      data: mockState.facilities,
      meta: { page: 1, limit: 10, total: mockState.facilities.length },
    };
  }

  const facilityIdMatch = cleanUrl.match(/\/facilities\/(fac_[a-z0-9_]+)$/);
  if (facilityIdMatch && method === 'GET') {
    const fac = mockState.facilities.find((f) => f.id === facilityIdMatch[1]) || mockState.facilities[0];
    return {
      success: true,
      message: 'Facility details retrieved',
      data: fac,
    };
  }

  if (cleanUrl.includes('/facilities/match') && method === 'POST') {
    const matchResults = mockState.matchFacilities((data || {}) as FacilityMatchRequest);
    return {
      success: true,
      message: 'Ranked facilities matching clinical criteria retrieved',
      data: matchResults,
    };
  }

  // 3. QUEUES & TOKENS
  if (cleanUrl.includes('/queues') && cleanUrl.includes('/live')) {
    return {
      success: true,
      message: 'Live queue state retrieved',
      data: mockState.liveQueue,
    };
  }

  if (cleanUrl.includes('/queues') && cleanUrl.includes('/next') && method === 'POST') {
    const calledToken = mockState.callNextToken();
    return {
      success: true,
      message: calledToken ? `Token ${calledToken.tokenNumber} called to Room 4` : 'No waiting tokens in queue',
      data: { calledToken, queue: mockState.liveQueue },
    };
  }

  if (cleanUrl.includes('/tokens') && method === 'POST') {
    const body = (data || {}) as { patientName?: string; patientPhone?: string; facilityId?: string; departmentId?: string };
    const token = mockState.generateToken(
      body.patientName || 'Rameshwar Sharma',
      body.patientPhone || '9876543210',
      body.facilityId || 'fac_civil_01',
      body.departmentId || 'dep_med'
    );
    return {
      success: true,
      message: `Digital Token ${token.tokenNumber} generated successfully`,
      data: token,
    };
  }

  if (cleanUrl.match(/\/tokens\/[a-z0-9_]+$/) && method === 'GET') {
    const userToken = mockState.liveQueue.tokens.find((t) => t.patientId === 'usr_pat_01') || mockState.liveQueue.tokens[0];
    return {
      success: true,
      message: 'Token status retrieved',
      data: userToken,
    };
  }

  // 4. EHR & CLINICAL TIMELINE
  if (cleanUrl.includes('/health-record') || cleanUrl.includes('/timeline')) {
    return {
      success: true,
      message: 'Patient health record retrieved',
      data: mockState.healthRecords.usr_pat_01,
    };
  }

  if (cleanUrl.includes('/prescriptions')) {
    if (method === 'PATCH' && cleanUrl.includes('/dispense')) {
      const rxId = cleanUrl.split('/')[4];
      const dispensed = mockState.dispensePrescription(rxId);
      return {
        success: true,
        message: 'Prescription marked as dispensed',
        data: dispensed,
      };
    }
    return {
      success: true,
      message: 'Prescriptions list retrieved',
      data: mockState.prescriptions,
    };
  }

  if (cleanUrl.includes('/diagnostics/orders')) {
    return {
      success: true,
      message: 'Diagnostic orders retrieved',
      data: mockState.diagnosticOrders,
    };
  }

  // 5. REFERRALS
  if (cleanUrl === '/api/v1/referrals' && method === 'GET') {
    return {
      success: true,
      message: 'Referrals retrieved',
      data: mockState.referrals,
      meta: { page: 1, limit: 10, total: mockState.referrals.length },
    };
  }

  if (cleanUrl === '/api/v1/referrals' && method === 'POST') {
    const created = mockState.createReferral(data as CreateReferralRequest);
    return {
      success: true,
      message: `Referral ${created.referralCode} dispatched successfully`,
      data: created,
    };
  }

  if (cleanUrl.includes('/referrals') && cleanUrl.includes('/accept')) {
    const ref = mockState.referrals[0];
    ref.status = 'ACCEPTED';
    ref.events.push({
      id: `ev_${Date.now()}`,
      status: 'ACCEPTED',
      timestamp: new Date().toISOString(),
      actorName: 'Receiving Medical Specialist',
      actorRole: 'SPECIALIST',
      facilityName: ref.toFacilityName,
    });
    return {
      success: true,
      message: 'Referral accepted and priority slot booked',
      data: ref,
    };
  }

  // 6. RESOURCES (Beds, Blood, Ambulances, Medicines, Equipment)
  if (cleanUrl.includes('/bed-summary') || cleanUrl.includes('/beds')) {
    if (method === 'PATCH') {
      const { category, available } = (data || {}) as { category: string; available: number };
      const updated = mockState.updateBedStatus('fac_civil_01', category, available);
      return {
        success: true,
        message: 'Bed status updated successfully',
        data: updated,
      };
    }
    return {
      success: true,
      message: 'Bed summary retrieved',
      data: mockState.bedSummary,
    };
  }

  if (cleanUrl.includes('/blood')) {
    return {
      success: true,
      message: 'Blood inventory retrieved',
      data: mockState.bloodInventory,
    };
  }

  if (cleanUrl.includes('/ambulances')) {
    return {
      success: true,
      message: 'Ambulance fleet status retrieved',
      data: mockState.ambulances,
    };
  }

  if (cleanUrl.includes('/medicines') || cleanUrl.includes('/medicine-inventory')) {
    return {
      success: true,
      message: 'Medicine inventory retrieved',
      data: mockState.medicines,
    };
  }

  if (cleanUrl.includes('/equipment')) {
    return {
      success: true,
      message: 'Medical equipment inventory retrieved',
      data: mockState.equipment,
    };
  }

  // 7. ASHA WORKFLOWS
  if (cleanUrl.includes('/asha/patients')) {
    if (method === 'POST') {
      const newPatient: AshaPatient = {
        ...((data || {}) as AshaPatient),
        id: `asha_p_${Date.now()}`,
        ashaId: 'usr_asha_01',
        ashaName: 'Sunita Devi',
        createdAt: new Date().toISOString(),
      };
      mockState.ashaPatients.unshift(newPatient);
      return {
        success: true,
        message: 'Citizen registered successfully by ASHA worker',
        data: newPatient,
      };
    }
    return {
      success: true,
      message: 'ASHA assigned patients retrieved',
      data: mockState.ashaPatients,
    };
  }

  if (cleanUrl.includes('/asha/visits')) {
    if (method === 'POST') {
      const newVisit: AshaVisit = {
        ...((data || {}) as AshaVisit),
        id: `vis_${Date.now()}`,
        isCompleted: false,
        status: 'SCHEDULED',
      };
      mockState.ashaVisits.unshift(newVisit);
      return {
        success: true,
        message: 'Home field visit scheduled successfully',
        data: newVisit,
      };
    }
    if (method === 'PATCH' || method === 'PUT') {
      const updateData = (data || {}) as Partial<AshaVisit> & { id: string };
      const visitIndex = mockState.ashaVisits.findIndex((v) => v.id === updateData.id);
      if (visitIndex >= 0) {
        mockState.ashaVisits[visitIndex] = {
          ...mockState.ashaVisits[visitIndex],
          ...updateData,
          completedAt: updateData.isCompleted ? new Date().toISOString() : mockState.ashaVisits[visitIndex].completedAt,
        };
        return {
          success: true,
          message: 'Home visit record updated',
          data: mockState.ashaVisits[visitIndex],
        };
      }
    }
    return {
      success: true,
      message: 'ASHA field visits retrieved',
      data: mockState.ashaVisits,
    };
  }

  if (cleanUrl.includes('/asha/tasks') || cleanUrl.includes('/asha/follow-ups')) {
    if (method === 'PATCH' || method === 'PUT') {
      const updateData = (data || {}) as { id: string; isCompleted: boolean };
      const taskIndex = mockState.ashaTasks.findIndex((t) => t.id === updateData.id);
      if (taskIndex >= 0) {
        mockState.ashaTasks[taskIndex].isCompleted = updateData.isCompleted;
        mockState.ashaTasks[taskIndex].completedAt = updateData.isCompleted ? new Date().toISOString() : undefined;
        return {
          success: true,
          message: 'Follow-up task updated',
          data: mockState.ashaTasks[taskIndex],
        };
      }
    }
    return {
      success: true,
      message: 'Frontline follow-up tasks retrieved',
      data: mockState.ashaTasks,
    };
  }

  if (cleanUrl.includes('/asha/referrals')) {
    if (method === 'POST') {
      const newRef: FrontlineReferral = {
        ...((data || {}) as FrontlineReferral),
        id: `ref_fl_${Date.now()}`,
        referralNumber: `REF-PET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        status: 'INITIATED',
        createdAt: new Date().toISOString(),
      };
      mockState.frontlineReferrals.unshift(newRef);
      return {
        success: true,
        message: 'Frontline referral dispatched to health facility',
        data: newRef,
      };
    }
    return {
      success: true,
      message: 'Frontline referrals retrieved',
      data: mockState.frontlineReferrals,
    };
  }

  if (cleanUrl.includes('/asha/screenings') && method === 'POST') {
    const session = data as ScreeningSession;
    mockState.screenings.push(session);
    return {
      success: true,
      message: 'Community screening logged and risk profile generated',
      data: session,
    };
  }

  if (cleanUrl.includes('/sync/push') && method === 'POST') {
    return {
      success: true,
      message: 'All local offline records successfully synchronized with central government repository',
      data: { syncedCount: 5, serverTimestamp: new Date().toISOString() },
    };
  }

  // 8. AI & DISTRICT DEMAND INTELLIGENCE
  if (cleanUrl.includes('/ai/dashboard') || cleanUrl.includes('/disease-trends') || cleanUrl.includes('/outbreak-alerts')) {
    return {
      success: true,
      message: 'AI demand intelligence retrieved',
      data: mockState.aiSummary,
    };
  }

  // 9. SUPER ADMIN & SYSTEM
  if (cleanUrl.includes('/super-admin/system-health') || cleanUrl.includes('/health')) {
    return {
      success: true,
      message: 'Realtime system services status retrieved',
      data: mockState.systemHealth,
    };
  }

  if (cleanUrl.includes('/super-admin/users')) {
    return {
      success: true,
      message: 'User registry retrieved',
      data: Object.values(mockState.users),
    };
  }

  if (cleanUrl.includes('/super-admin/roles')) {
    return {
      success: true,
      message: 'Role-permission matrix retrieved',
      data: mockState.permissions,
    };
  }

  if (cleanUrl.includes('/super-admin/ai-models')) {
    return {
      success: true,
      message: 'AI Model registry retrieved',
      data: mockState.aiModels,
    };
  }

  if (cleanUrl.includes('/super-admin/audit')) {
    return {
      success: true,
      message: 'Audit logs retrieved',
      data: mockState.auditLogs,
    };
  }

  // Fallback for unhandled endpoints
  return {
    success: true,
    message: 'Request fulfilled',
    data: {},
  };
}
