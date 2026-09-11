import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { appointmentApi } from '@/api/queueApi';
import { Link } from 'react-router-dom';

import {
  CalendarDays,
  Clock,
  Building2,
  Stethoscope,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  History,
} from 'lucide-react';

export const AppointmentBooking: React.FC = () => {
  const [facilityId, setFacilityId] = useState('fac_civil_01');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [date, setDate] = useState('2026-09-14');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [reason, setReason] = useState(
    'Routine blood sugar and blood pressure review'
  );

  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const availableSlots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
  ];

  /*
   * Previous appointments
   * Replace this later with API data.
   */
  const previousAppointments = [
    {
      id: 'APT-1025',
      date: '28 Aug 2026',
      hospital: 'Gandhinagar Civil Hospital',
      department: 'General Medicine',
      time: '10:30 AM',
      status: 'Completed',
    },
    {
      id: 'APT-1018',
      date: '10 Aug 2026',
      hospital: 'Mansa Community Health Centre',
      department: 'General Medicine',
      time: '11:00 AM',
      status: 'Completed',
    },
    {
      id: 'APT-1007',
      date: '22 Jul 2026',
      hospital: 'Gandhinagar Civil Hospital',
      department: 'Cardiology',
      time: '09:30 AM',
      status: 'Cancelled',
    },
    {
      id: 'APT-0994',
      date: '05 Jul 2026',
      hospital: 'Kalol Sub-District Hospital',
      department: 'Orthopedics',
      time: '02:00 PM',
      status: 'Completed',
    },
  ];

  const selectedFacility = INITIAL_FACILITIES.find(
    (facility) => facility.id === facilityId
  );

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      await appointmentApi.book({
        facilityId,
        specialty,
        date,
        timeSlot: selectedSlot,
        reasonForVisit: reason,
      });

      setIsBooked(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <PageHeader
        title="Book an Appointment"
        subtitle="Choose a hospital, department, date and time for your visit."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Appointments' },
        ]}
      />


      {/* =========================================
          BOOK APPOINTMENT
      ========================================== */}

      <Card className="border-slate-200 bg-white shadow-sm">

        <CardContent className="p-4 sm:p-5">

          {/* Section Header */}

          <div className="flex items-center gap-2.5 mb-4">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
              <CalendarDays className="h-4 w-4 text-teal-700" />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                New Appointment
              </h2>

              <p className="text-[11px] text-slate-500">
                Select your visit details
              </p>

            </div>

          </div>


          {/* =====================================
              SUCCESS MESSAGE
          ====================================== */}

          {isBooked ? (

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">

                  <CheckCircle2 className="h-5 w-5 text-emerald-700" />

                </div>

                <div className="min-w-0">

                  <h3 className="text-sm font-bold text-emerald-900">
                    Appointment Confirmed
                  </h3>

                  <p className="mt-0.5 text-[11px] text-emerald-700">
                    Your appointment has been successfully booked.
                  </p>

                </div>

              </div>


              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">

                <div className="rounded-lg bg-white border border-emerald-100 p-2.5">

                  <p className="text-[9px] font-semibold uppercase text-slate-400">
                    Hospital
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-800 truncate">
                    {selectedFacility?.name || 'Hospital'}
                  </p>

                </div>


                <div className="rounded-lg bg-white border border-emerald-100 p-2.5">

                  <p className="text-[9px] font-semibold uppercase text-slate-400">
                    Department
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-800">
                    {specialty}
                  </p>

                </div>


                <div className="rounded-lg bg-white border border-emerald-100 p-2.5">

                  <p className="text-[9px] font-semibold uppercase text-slate-400">
                    Date
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-800">
                    {date}
                  </p>

                </div>


                <div className="rounded-lg bg-white border border-emerald-100 p-2.5">

                  <p className="text-[9px] font-semibold uppercase text-slate-400">
                    Time
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-slate-800">
                    {selectedSlot}
                  </p>

                </div>

              </div>


              <div className="mt-3">

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBooked(false)}
                  className="text-xs"
                >
                  Book Another Appointment
                </Button>

              </div>

            </div>

          ) : (

            /* =====================================
               BOOKING FORM
            ====================================== */

            <form
              onSubmit={handleBooking}
              className="space-y-4"
            >

              {/* =================================
                  ROW 1
              ================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">


                {/* Hospital */}

                <div className="space-y-1.5">

                  <label className="text-xs font-semibold text-slate-700">
                    Hospital / Health Centre
                  </label>

                  <div className="relative">

                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />

                    <select
                      value={facilityId}
                      onChange={(e) =>
                        setFacilityId(e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    >

                      {INITIAL_FACILITIES.map((facility) => (

                        <option
                          key={facility.id}
                          value={facility.id}
                        >
                          {facility.name}
                        </option>

                      ))}

                    </select>

                  </div>

                  {selectedFacility && (

                    <p className="flex items-center gap-1 text-[10px] text-slate-400">

                      <MapPin className="h-3 w-3" />

                      {selectedFacility.distanceKm} km away

                    </p>

                  )}

                </div>


                {/* Department */}

                <div className="space-y-1.5">

                  <label className="text-xs font-semibold text-slate-700">
                    Department
                  </label>

                  <div className="relative">

                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />

                    <select
                      value={specialty}
                      onChange={(e) =>
                        setSpecialty(e.target.value)
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    >

                      <option value="General Medicine">
                        General Medicine
                      </option>

                      <option value="Cardiology">
                        Cardiology
                      </option>

                      <option value="Orthopedics">
                        Orthopedics
                      </option>

                      <option value="Pediatrics">
                        Pediatrics
                      </option>

                      <option value="Obstetrics & Gynecology">
                        Women's Health
                      </option>

                    </select>

                  </div>

                </div>

              </div>


              {/* =================================
                  ROW 2
              ================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">


                {/* Date */}

                <Input
                  label="Visit Date"
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  required
                  className="h-10"
                />


                {/* Reason */}

                <Input
                  label="Reason for Visit"
                  type="text"
                  placeholder="Example: Fever, check-up, body pain..."
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value)
                  }
                  required
                  className="h-10"
                />

              </div>


              {/* =================================
                  TIME SELECTION
              ================================== */}

              <div className="space-y-2">

                <div className="flex items-center gap-2">

                  <Clock className="h-4 w-4 text-teal-600" />

                  <div>

                    <p className="text-xs font-semibold text-slate-700">
                      Choose Visit Time
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Select any available time
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">

                  {availableSlots.map((slot) => (

                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setSelectedSlot(slot)
                      }
                      className={`
                        rounded-lg border px-2 py-2.5
                        text-[10px] sm:text-xs
                        font-semibold transition
                        ${
                          selectedSlot === slot
                            ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-teal-50'
                        }
                      `}
                    >
                      {slot}
                    </button>

                  ))}

                </div>

              </div>


              {/* =================================
                  BOTTOM SUMMARY + BUTTON
              ================================== */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5">

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-wide text-teal-700">
                    Selected Appointment
                  </p>

                  <p className="mt-0.5 text-xs font-bold text-teal-950">
                    {date} • {selectedSlot}
                  </p>

                </div>


                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800"
                  isLoading={isLoading}
                >
                  Confirm Appointment
                </Button>

              </div>

            </form>

          )}

        </CardContent>

      </Card>


      {/* =========================================
          PREVIOUS APPOINTMENTS
      ========================================== */}

      <Card className="border-slate-200 bg-white shadow-sm">

        <CardContent className="p-0">

          {/* History Header */}

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">

            <div className="flex items-center gap-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">

                <History className="h-4 w-4 text-slate-600" />

              </div>

              <div>

                <h2 className="text-sm font-bold text-slate-900">
                  Previous Appointments
                </h2>

                <p className="text-[10px] text-slate-500">
                  Your past hospital visits
                </p>

              </div>

            </div>


            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">

              {previousAppointments.length} appointments

            </span>

          </div>


          {/* =====================================
              DESKTOP TABLE
          ====================================== */}

          <div className="hidden md:block overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Date
                  </th>

                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Hospital
                  </th>

                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Department
                  </th>

                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Time
                  </th>

                  <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                  <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {previousAppointments.map((appointment) => (

                  <tr
                    key={appointment.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                  >

                    {/* Date */}

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-1.5">

                        <CalendarDays className="h-3.5 w-3.5 text-teal-600" />

                        <span className="text-xs font-semibold text-slate-800">
                          {appointment.date}
                        </span>

                      </div>

                    </td>


                    {/* Hospital */}

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-2">

                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />

                        <span className="text-xs font-medium text-slate-800">
                          {appointment.hospital}
                        </span>

                      </div>

                    </td>


                    {/* Department */}

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-1.5">

                        <Stethoscope className="h-3.5 w-3.5 text-slate-400" />

                        <span className="text-xs text-slate-600">
                          {appointment.department}
                        </span>

                      </div>

                    </td>


                    {/* Time */}

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-1.5">

                        <Clock className="h-3.5 w-3.5 text-slate-400" />

                        <span className="text-xs text-slate-600">
                          {appointment.time}
                        </span>

                      </div>

                    </td>


                    {/* Status */}

                    <td className="px-4 py-3">

                      {appointment.status === 'Completed' ? (

                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">

                          <CheckCircle2 className="h-3 w-3" />

                          Completed

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">

                          <XCircle className="h-3 w-3" />

                          Cancelled

                        </span>

                      )}

                    </td>


                    {/* Action */}

                    <td className="px-4 py-3 text-right">

<Link
  to={`/patient/appointments/${appointment.id}`}
  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
>
  <Eye className="h-3 w-3" />
  View
</Link>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>


          {/* =====================================
              MOBILE HISTORY
          ====================================== */}

          <div className="md:hidden divide-y divide-slate-100">

            {previousAppointments.map((appointment) => (

              <div
                key={appointment.id}
                className="p-3"
              >

                <div className="flex items-start justify-between gap-2">

                  <div className="min-w-0">

                    <p className="text-xs font-bold text-slate-900 truncate">
                      {appointment.hospital}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {appointment.department}
                    </p>

                  </div>


                  {appointment.status === 'Completed' ? (

                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                      Completed
                    </span>

                  ) : (

                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-600">
                      Cancelled
                    </span>

                  )}

                </div>


                <div className="mt-2 flex items-center justify-between">

                  <div className="flex items-center gap-3 text-[10px] text-slate-500">

                    <span className="flex items-center gap-1">

                      <CalendarDays className="h-3 w-3" />

                      {appointment.date}

                    </span>

                    <span className="flex items-center gap-1">

                      <Clock className="h-3 w-3" />

                      {appointment.time}

                    </span>

                  </div>


                  <button
                    type="button"
                    className="flex items-center gap-1 text-[10px] font-semibold text-teal-700"
                  >

                    <Eye className="h-3 w-3" />

                    View

                  </button>

                </div>

              </div>

            ))}

          </div>

        </CardContent>

      </Card>

    </div>
  );
};