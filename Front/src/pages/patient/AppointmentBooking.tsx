import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { INITIAL_FACILITIES } from '@/mock/mockData';
import { appointmentApi } from '@/api/queueApi';
import { Calendar as CalendarIcon, Clock, Stethoscope, Building2, CheckCircle2, User } from 'lucide-react';

export const AppointmentBooking: React.FC = () => {
  const [facilityId, setFacilityId] = useState('fac_civil_01');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [date, setDate] = useState('2026-03-14');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [reason, setReason] = useState('Routine blood sugar and blood pressure review');
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Schedule OPD Appointment"
        subtitle="Book an in-person hospital OPD slot or specialized medical clinic consultation."
        breadcrumbs={[{ label: 'Dashboard', to: '/patient' }, { label: 'Appointments' }]}
      />

      {isBooked ? (
        <Card className="border-emerald-200 bg-white p-8 text-center space-y-4 shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your consultation with the <strong>{specialty} OPD</strong> at{' '}
            <strong>Gandhinagar Civil Hospital</strong> has been reserved for:
          </p>

          <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 max-w-sm mx-auto space-y-1 text-emerald-950">
            <p className="text-xs uppercase font-bold tracking-wider text-emerald-800">Date & Slot</p>
            <p className="text-xl font-extrabold">{date} at {selectedSlot}</p>
            <p className="text-xs text-emerald-700">Counter Desk: Room 4 (General Medicine Wing)</p>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <Button onClick={() => setIsBooked(false)} variant="primary" className="bg-teal-700 hover:bg-teal-800">
              Book Another Appointment
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-slate-200 bg-white shadow-md">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleBooking} className="space-y-6">
              {/* Facility & Specialty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Health Facility
                  </label>
                  <select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    {INITIAL_FACILITIES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.distanceKm} km)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Specialty Clinic
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="flex min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
                  >
                    <option value="General Medicine">General Medicine OPD</option>
                    <option value="Cardiology">Cardiology Specialist Clinic</option>
                    <option value="Orthopedics">Orthopedics & Trauma Clinic</option>
                    <option value="Pediatrics">Pediatrics & Neonatal Care</option>
                    <option value="Obstetrics & Gynecology">Obstetrics & Maternal Clinic</option>
                  </select>
                </div>
              </div>

              {/* Date & Slots */}
              <div className="space-y-3 text-left">
                <Input
                  label="Select Consultation Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Available OPD Time Slots
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all min-h-[44px] ${
                          selectedSlot === slot
                            ? 'bg-teal-700 text-white border-teal-800 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <Input
                label="Primary Symptom / Reason for Visit"
                type="text"
                placeholder="e.g. Chronic joint pain, high blood pressure checkup..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full bg-teal-700 hover:bg-teal-800" isLoading={isLoading}>
                Confirm OPD Slot Booking
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
