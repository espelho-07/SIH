import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { INITIAL_REFERRALS } from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Stethoscope,
} from 'lucide-react';

export const ReferralDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const referral = INITIAL_REFERRALS.find(
    (item) => item.id === id
  );

  if (!referral) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Referral not found
            </h2>

            <Button
              onClick={() => navigate('/patient/referrals')}
              className="mt-4"
              variant="outline"
            >
              Back to Referrals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/patient/referrals')}
          className="h-8 px-3"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </Button>

        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Referral Details
          </h1>

          <p className="text-xs text-slate-500">
            View your referral information
          </p>
        </div>

      </div>


      {/* Main Details */}
      <Card className="border-slate-200 shadow-sm">

        <CardContent className="p-4">

          {/* Referral ID + Status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">

            <div>
              <p className="text-[10px] font-medium uppercase text-slate-400">
                Referral ID
              </p>

              <h2 className="mt-0.5 text-base font-bold text-slate-900">
                {referral.referralCode}
              </h2>
            </div>

            <div className="flex gap-2">
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold text-teal-700">
                {referral.status}
              </span>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                {referral.priority}
              </span>
            </div>

          </div>


          {/* Basic Information */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

              <div className="flex items-center gap-2">

                <Stethoscope className="h-4 w-4 text-teal-600" />

                <div>
                  <p className="text-[10px] text-slate-400">
                    Referred For
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {referral.reasonForReferral}
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

              <div className="flex items-center gap-2">

                <Building2 className="h-4 w-4 text-teal-600" />

                <div>
                  <p className="text-[10px] text-slate-400">
                    Hospital
                  </p>

                  <p className="text-sm font-semibold text-slate-900">
                    {referral.toFacilityName}
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* Appointment */}
          <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">

            <div className="flex items-center gap-2">

              <CalendarDays className="h-4 w-4 text-indigo-600" />

              <div>
                <p className="text-[10px] text-indigo-500">
                  Appointment
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {referral.appointmentSlot || 'Not scheduled'}
                </p>
              </div>

            </div>

          </div>


          {/* Referral Information */}
          <div className="mt-4">

            <h3 className="text-sm font-bold text-slate-900">
              Referral Information
            </h3>

            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">

              <div>
                <p className="text-slate-400">
                  Sent By
                </p>

                <p className="font-medium text-slate-800">
                  {referral.fromDoctorName}
                </p>
              </div>


              <div>
                <p className="text-slate-400">
                  From Hospital
                </p>

                <p className="font-medium text-slate-800">
                  {referral.fromFacilityName}
                </p>
              </div>


              <div>
                <p className="text-slate-400">
                  Department
                </p>

                <p className="font-medium text-slate-800">
                  {referral.toSpecialty}
                </p>
              </div>


              <div>
                <p className="text-slate-400">
                  Created
                </p>

                <p className="font-medium text-slate-800">
                  {formatDate(referral.createdAt)}
                </p>
              </div>

            </div>

          </div>


          {/* Reason */}
          <div className="mt-4">

            <h3 className="text-sm font-bold text-slate-900">
              Doctor's Note
            </h3>

            <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 p-3">

              <p className="text-xs leading-relaxed text-slate-600">
                {referral.clinicalSummary}
              </p>

            </div>

          </div>


          {/* History */}
          <div className="mt-5">

            <h3 className="text-sm font-bold text-slate-900">
              Referral History
            </h3>

            <div className="mt-2 divide-y divide-slate-100">

              {referral.events.map((event) => (

                <div
                  key={event.id}
                  className="flex items-center justify-between py-2.5"
                >

                  <div className="flex items-center gap-2">

                    <CheckCircle2 className="h-4 w-4 text-teal-600" />

                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {event.status}
                      </p>

                      <p className="text-[10px] text-slate-500">
                        {event.facilityName}
                      </p>
                    </div>

                  </div>

                  <span className="text-[10px] text-slate-400">
                    {formatDate(event.timestamp)}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </CardContent>

      </Card>

    </div>
  );
};