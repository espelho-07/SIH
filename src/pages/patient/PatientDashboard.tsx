import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { EmergencyButton } from '@/components/emergency/EmergencyButton';
import { MapView } from '@/components/map/MapView';
import { INITIAL_FACILITIES, INITIAL_LIVE_QUEUE, INITIAL_REFERRALS } from '@/mock/mockData';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Building2,
  GitBranch,
  FileText,
  Clock,
  ArrowRight,
  MapPin,
  BellRing,
  Navigation,
  CheckCircle2,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { simulateCallToken } = useSocket();

  const activeToken = INITIAL_LIVE_QUEUE.tokens.find((t) => t.patientId === 'usr_pat_01') || INITIAL_LIVE_QUEUE.tokens[3];
  const activeReferral = INITIAL_REFERRALS[0];
  const nearbyFacilities = INITIAL_FACILITIES.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Emergency Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 to-teal-800 text-white p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
            Citizen Health Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {user?.name || 'Rameshwar Sharma'}
          </h1>
          <p className="text-xs text-teal-100/90">
            ABHA: <strong>{user?.abhaId || '14-8921-3409-7721'}</strong> • Primary Facility: Gandhinagar Civil Hospital
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EmergencyButton />
        </div>
      </div>

      {/* Quick Action Buttons (6 Primary Patient Flows) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link to="/patient/facilities">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group">
            <Building2 className="h-5 w-5 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Find Hospital</span>
            <span className="text-[10px] text-slate-500">Beds & Doctors</span>
          </Card>
        </Link>

        <Link to="/patient/tokens">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group">
            <Ticket className="h-5 w-5 text-sky-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Live Token</span>
            <span className="text-[10px] text-slate-500">Track Position</span>
          </Card>
        </Link>

        <Link to="/patient/appointments">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group">
            <Calendar className="h-5 w-5 text-indigo-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Book Slot</span>
            <span className="text-[10px] text-slate-500">OPD & Teleconsult</span>
          </Card>
        </Link>

        <Link to="/patient/referrals">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group">
            <GitBranch className="h-5 w-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">My Referrals</span>
            <span className="text-[10px] text-slate-500">SLA Tracking</span>
          </Card>
        </Link>

        <Link to="/patient/records">
          <Card className="p-3.5 hover:border-teal-500 hover:shadow-md transition-all text-left group">
            <FileText className="h-5 w-5 text-emerald-700 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-900 block">Health Records</span>
            <span className="text-[10px] text-slate-500">EHR & Prescriptions</span>
          </Card>
        </Link>

        <Link to="/patient/facilities">
          <Card className="p-3.5 hover:border-red-400 hover:shadow-md transition-all text-left group bg-red-50/40">
            <BellRing className="h-5 w-5 text-red-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-red-950 block">Emergency</span>
            <span className="text-[10px] text-red-700">108 Hotlines</span>
          </Card>
        </Link>
      </div>

      {/* Main Focus: Live Token Tracker & Referral Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Token Card with simulated call button */}
        <Card className="lg:col-span-2 border-teal-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <span className="font-bold text-sm">Active OPD Token Tracking</span>
            </div>
            <StatusBadge status="WAITING" className="bg-teal-800 text-white border-teal-600" />
          </div>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Your Token</span>
                <p className="text-3xl sm:text-4xl font-black text-teal-800 mt-1">{activeToken.tokenNumber}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Queue Position</span>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">{activeToken.positionInQueue}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Est. Wait Time</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                  {activeToken.estimatedWaitMinutes} <span className="text-sm font-medium">mins</span>
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Current Calling</span>
                <p className="text-3xl sm:text-4xl font-black text-slate-500 mt-1">
                  {INITIAL_LIVE_QUEUE.currentTokenNumber}
                </p>
              </div>
            </div>

            {/* Visual Queue Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Current: A-035 (Room 4)</span>
                <span>You are 7 patients away</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full w-[45%]" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-teal-700" />
                <span>
                  <strong>{activeToken.facilityName}</strong> • {activeToken.departmentName}
                </span>
              </div>

              {/* Demo Button to test Calling Modal */}
              <Button
                onClick={() => simulateCallToken(activeToken)}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-teal-800 border-teal-300 hover:bg-teal-50"
              >
                <BellRing className="h-3.5 w-3.5" />
                Simulate Doctor Calling You
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Referral Card */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Referral</span>
              <PriorityBadge priority={activeReferral.priority} />
            </div>
            <CardTitle className="text-base font-bold text-slate-900 mt-1">{activeReferral.referralCode}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 flex-1 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
              <p className="text-slate-500 font-medium">Referred For:</p>
              <p className="font-semibold text-slate-900 text-sm">{activeReferral.toSpecialty}</p>
              <p className="text-slate-600 line-clamp-2">{activeReferral.reasonForReferral}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400">Destination:</span>
              <p className="font-semibold text-slate-800">{activeReferral.toFacilityName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400">Confirmed Slot:</span>
              <p className="font-semibold text-teal-700">{activeReferral.appointmentSlot || 'Pending scheduling'}</p>
            </div>
          </CardContent>

          <div className="p-5 pt-0 border-t border-slate-100">
            <Link to="/patient/referrals" className="w-full">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <span>View Closed-Loop Timeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Nearby Healthcare Facilities Map & List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Nearby Public Health Facilities</h2>
            <p className="text-xs text-slate-500">Real-time bed availability & emergency status</p>
          </div>
          <Link to="/patient/facilities">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <span>View All Facilities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapView facilities={INITIAL_FACILITIES} />
          </div>

          <div className="space-y-3">
            {nearbyFacilities.map((facility) => (
              <Card key={facility.id} className="p-4 hover:shadow-md transition-all space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{facility.name}</h3>
                    <p className="text-xs text-slate-500">
                      {facility.type.replace(/_/g, ' ')} • {facility.distanceKm} km away
                    </p>
                  </div>
                  {facility.isOpen ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Open Now
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      Closed
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-lg text-slate-600">
                  <div>
                    Avail. Beds: <strong>{facility.availableBeds} / {facility.totalBeds}</strong>
                  </div>
                  <div className="text-red-700">
                    ICU Beds: <strong>{facility.icuBedsAvailable} free</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Link to={`/patient/facilities/${facility.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View Details
                    </Button>
                  </Link>
                  <Link to="/patient/tokens" className="flex-1">
                    <Button variant="primary" size="sm" className="w-full text-xs bg-teal-700 hover:bg-teal-800">
                      Get Token
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
