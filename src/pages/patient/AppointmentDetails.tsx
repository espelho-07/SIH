import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { INITIAL_FACILITIES } from '@/mock/mockData';

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  FileText,
  Hash,
  RefreshCw,
} from 'lucide-react';

export const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  /*
   * Demo appointment data.
   * Later this can be replaced with API data using the appointment ID.
   */
  const appointments = [
    {
      id: 'APT-2026-001',
      facilityId: 'fac_civil_01',
      hospital: 'Gandhinagar Civil Hospital & Medical College',
      department: 'General Medicine',
      doctor: 'Dr. Arvind Patel',
      date: '2026-09-15',
      time: '10:30 AM',
      reason: 'Routine blood sugar and blood pressure review',
      status: 'CONFIRMED',
      room: 'Room 4',
      bookingDate: '2026-09-10',
      patientName: 'Rameshwar Sharma',
      patientPhone: '9876543210',
    },
    {
      id: 'APT-2026-002',
      facilityId: 'fac_mansa_02',
      hospital: 'Mansa Community Health Centre',
      department: 'General Medicine',
      doctor: 'Dr. Mehta',
      date: '2026-08-28',
      time: '11:00 AM',
      reason: 'Fever and weakness',
      status: 'COMPLETED',
      room: 'OPD Room 2',
      bookingDate: '2026-08-25',
      patientName: 'Rameshwar Sharma',
      patientPhone: '9876543210',
    },
    {
      id: 'APT-2026-003',
      facilityId: 'fac_kalol_03',
      hospital: 'Kalol Sub-District Hospital',
      department: 'Orthopedics',
      doctor: 'Dr. Shah',
      date: '2026-07-12',
      time: '02:30 PM',
      reason: 'Knee pain check-up',
      status: 'CANCELLED',
      room: 'OPD Room 5',
      bookingDate: '2026-07-08',
      patientName: 'Rameshwar Sharma',
      patientPhone: '9876543210',
    },
  ];

  const appointment =
    appointments.find((item) => item.id === id) || appointments[0];

  const facility = INITIAL_FACILITIES.find(
    (item) => item.id === appointment.facilityId
  );

  const getStatus = () => {
    switch (appointment.status) {
      case 'CONFIRMED':
        return {
          label: 'Confirmed',
          text: 'Your appointment is confirmed.',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
        };

      case 'COMPLETED':
        return {
          label: 'Completed',
          text: 'You have completed this appointment.',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: CheckCircle2,
        };

      case 'CANCELLED':
        return {
          label: 'Cancelled',
          text: 'This appointment was cancelled.',
          className: 'bg-red-50 text-red-700 border-red-200',
          icon: CheckCircle2,
        };

      default:
        return {
          label: 'Appointment',
          text: 'Appointment details',
          className: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: CalendarDays,
        };
    }
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* =========================
          PAGE HEADER
      ========================== */}

      <PageHeader
        title="Appointment Details"
        subtitle="See all information about your hospital appointment."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Appointments', to: '/patient/appointments' },
          { label: 'Appointment Details' },
        ]}
        actions={
          <Link to="/patient/appointments">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      {/* =========================
          STATUS
      ========================== */}

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div className="flex items-center gap-3">

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  appointment.status === 'CONFIRMED'
                    ? 'bg-emerald-100'
                    : appointment.status === 'COMPLETED'
                    ? 'bg-blue-100'
                    : 'bg-red-100'
                }`}
              >
                <StatusIcon
                  className={`h-5 w-5 ${
                    appointment.status === 'CONFIRMED'
                      ? 'text-emerald-700'
                      : appointment.status === 'COMPLETED'
                      ? 'text-blue-700'
                      : 'text-red-600'
                  }`}
                />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Appointment Status
                </p>

                <h2 className="text-base font-bold text-slate-900">
                  {status.label}
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  {status.text}
                </p>
              </div>

            </div>

            <div
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
            >
              {status.label}
            </div>

          </div>

        </CardContent>
      </Card>


      {/* =========================
          APPOINTMENT DATE & TIME
      ========================== */}

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">

          <div className="flex items-center gap-2 mb-4">

            <CalendarDays className="h-5 w-5 text-teal-700" />

            <h2 className="text-sm font-bold text-slate-900">
              When to Visit
            </h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">

              <div className="flex items-center gap-2">

                <CalendarDays className="h-4 w-4 text-teal-700" />

                <span className="text-xs text-teal-700 font-medium">
                  Date
                </span>

              </div>

              <p className="mt-1 text-base font-bold text-slate-900">
                {appointment.date}
              </p>

            </div>


            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">

              <div className="flex items-center gap-2">

                <Clock className="h-4 w-4 text-amber-700" />

                <span className="text-xs text-amber-700 font-medium">
                  Time
                </span>

              </div>

              <p className="mt-1 text-base font-bold text-slate-900">
                {appointment.time}
              </p>

            </div>

          </div>

        </CardContent>
      </Card>


      {/* =========================
          HOSPITAL INFORMATION
      ========================== */}

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">

          <div className="flex items-center gap-2 mb-4">

            <Building2 className="h-5 w-5 text-teal-700" />

            <h2 className="text-sm font-bold text-slate-900">
              Hospital Information
            </h2>

          </div>

          <div className="space-y-3">

            <div>

              <p className="text-[11px] text-slate-500">
                Hospital
              </p>

              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {appointment.hospital}
              </p>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">

                <div className="flex items-center gap-2">

                  <Stethoscope className="h-4 w-4 text-teal-700" />

                  <div>

                    <p className="text-[10px] text-slate-400">
                      Department
                    </p>

                    <p className="text-xs font-bold text-slate-800">
                      {appointment.department}
                    </p>

                  </div>

                </div>

              </div>


              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">

                <div className="flex items-center gap-2">

                  <User className="h-4 w-4 text-teal-700" />

                  <div>

                    <p className="text-[10px] text-slate-400">
                      Doctor
                    </p>

                    <p className="text-xs font-bold text-slate-800">
                      {appointment.doctor}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            <div className="flex items-center gap-2 text-xs text-slate-600">

              <MapPin className="h-4 w-4 text-teal-600 shrink-0" />

              <span>
                {facility?.address || 'Hospital address available at facility'}
              </span>

            </div>

          </div>

        </CardContent>
      </Card>


      {/* =========================
          PATIENT & VISIT DETAILS
      ========================== */}

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">

          <div className="flex items-center gap-2 mb-4">

            <FileText className="h-5 w-5 text-teal-700" />

            <h2 className="text-sm font-bold text-slate-900">
              Visit Details
            </h2>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">

              <p className="text-[10px] text-slate-400">
                Patient Name
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {appointment.patientName}
              </p>

            </div>


            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">

              <p className="text-[10px] text-slate-400">
                Phone Number
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {appointment.patientPhone}
              </p>

            </div>


            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">

              <p className="text-[10px] text-slate-400">
                Room / Counter
              </p>

              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {appointment.room}
              </p>

            </div>


            <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">

              <p className="text-[10px] text-slate-400">
                Appointment ID
              </p>

              <div className="flex items-center gap-1.5 mt-0.5">

                <Hash className="h-3.5 w-3.5 text-slate-400" />

                <p className="text-sm font-semibold text-slate-800">
                  {appointment.id}
                </p>

              </div>

            </div>

          </div>


          {/* Reason */}

          <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3">

            <p className="text-[10px] text-slate-400">
              Reason for Visit
            </p>

            <p className="text-sm font-medium text-slate-800 mt-0.5">
              {appointment.reason}
            </p>

          </div>

        </CardContent>
      </Card>


      {/* =========================
          SIMPLE INSTRUCTIONS
      ========================== */}

      {appointment.status === 'CONFIRMED' && (

        <Card className="border-teal-100 bg-teal-50/60">

          <CardContent className="p-4">

            <div className="flex gap-3">

              <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />

              <div>

                <p className="text-sm font-bold text-teal-900">
                  What you need to do
                </p>

                <ul className="mt-1.5 space-y-1 text-xs text-teal-800">

                  <li>• Reach the hospital before your appointment time.</li>

                  <li>• Carry your health documents if available.</li>

                  <li>• Go to {appointment.room} for your consultation.</li>

                </ul>

              </div>

            </div>

          </CardContent>

        </Card>

      )}


      {/* =========================
          ACTIONS
      ========================== */}

      <div className="flex flex-col sm:flex-row gap-2">

        {facility && (

          <a
            href={`tel:${facility.contactNumber}`}
            className="flex-1"
          >

            <Button
              variant="outline"
              size="md"
              className="w-full gap-1.5"
            >

              <Phone className="h-4 w-4" />

              Call Hospital

            </Button>

          </a>

        )}


        {facility && (

          <a
            href={`https://maps.google.com/?q=${facility.coordinates.lat},${facility.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >

            <Button
              variant="outline"
              size="md"
              className="w-full gap-1.5"
            >

              <Navigation className="h-4 w-4 text-teal-700" />

              Get Directions

            </Button>

          </a>

        )}


        <Link
          to="/patient/appointments"
          className="flex-1"
        >

          <Button
            variant="primary"
            size="md"
            className="w-full gap-1.5 bg-teal-700 hover:bg-teal-800"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Appointments

          </Button>

        </Link>

      </div>


      {/* Book Again */}

      {appointment.status !== 'CONFIRMED' && (

        <div className="flex justify-center pb-2">

          <Link to="/patient/appointments">

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
            >

              <RefreshCw className="h-4 w-4" />

              Book Another Appointment

            </Button>

          </Link>

        </div>

      )}

    </div>
  );
};