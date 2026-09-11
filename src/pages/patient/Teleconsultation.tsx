import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Video,
  History,
  ArrowRight,
  CalendarDays,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

export const Teleconsultation: React.FC = () => {
  return (
    <div className="space-y-5">

      {/* Page Header */}
      <PageHeader
        title="Teleconsultation"
        subtitle="Connect with a doctor online or view your previous consultation history."
        breadcrumbs={[
          { label: 'Dashboard', to: '/patient' },
          { label: 'Teleconsultation' },
        ]}
      />

      {/* Main Card */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-5 sm:p-6">

          {/* Heading */}
          <div className="mb-6">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50">
                <Stethoscope className="h-5 w-5 text-teal-700" />
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Teleconsultation Services
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Choose what you want to do
                </p>
              </div>

            </div>

          </div>


          {/* Choice Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* =====================================
                CONSULTATION HISTORY
            ====================================== */}

            <Link
              to="/patient/teleconsultation-history"
              className="group"
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm">

                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200">

                    <History className="h-5 w-5 text-slate-600 group-hover:text-teal-700" />

                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-700" />

                </div>


                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  Consultation History
                </h3>

                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
                  View your previous online consultations, doctors,
                  consultation notes and visit details.
                </p>


                <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-teal-700">

                  <CalendarDays className="h-3.5 w-3.5" />

                  View previous consultations

                </div>

              </div>
            </Link>


            {/* =====================================
                START CONSULTATION
            ====================================== */}

            <Link
              to="/patient/consultations/room"
              className="group"
            >
              <div className="h-full rounded-2xl border border-teal-200 bg-teal-50/60 p-5 transition-all hover:border-teal-400 hover:bg-teal-50 hover:shadow-sm">

                <div className="flex items-start justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white">

                    <Video className="h-5 w-5" />

                  </div>

                  <ArrowRight className="h-4 w-4 text-teal-500 group-hover:text-teal-700" />

                </div>


                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  Start / Join Consultation
                </h3>

                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-600">
                  Join your scheduled online consultation and
                  speak directly with a doctor.
                </p>


                <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-teal-700">

                  <ShieldCheck className="h-3.5 w-3.5" />

                  Secure doctor consultation

                </div>

              </div>
            </Link>

          </div>


          {/* Information */}
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">

            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

            <p className="text-[10px] leading-relaxed text-slate-500">
              Your consultation information and clinical notes are securely
              maintained in your health record.
            </p>

          </div>

        </CardContent>
      </Card>

    </div>
  );
};

export default Teleconsultation;