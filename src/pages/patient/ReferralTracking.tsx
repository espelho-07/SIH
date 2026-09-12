import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { INITIAL_REFERRALS } from '@/mock/mockData';
import { formatDate } from '@/lib/formatters';

import {
  GitBranch,
  Building2,
  Stethoscope,
  CalendarDays,
  ChevronRight,
  FileText,
} from 'lucide-react';

export const ReferralTracking: React.FC = () => {
  const { t } = useTranslation();
  const referrals = INITIAL_REFERRALS;

  // First referral = current / active referral
  const activeReferral = referrals[0];

  // Remaining referrals = history
  const referralHistory = referrals.slice(1);

  return (
    <div className="space-y-4">

      {/* ================================
          PAGE HEADER
      ================================= */}
      <PageHeader
        title={t('referrals.title')}
        subtitle={t('referrals.subtitle')}
        breadcrumbs={[
          { label: t('nav.Dashboard'), to: '/patient' },
          { label: t('referrals.title') },
        ]}
      />

      {/* ================================
          CURRENT REFERRAL
      ================================= */}
      {activeReferral && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                  <GitBranch className="h-4 w-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      {t('referrals.currentReferral')}
                    </h2>

                    <PriorityBadge
                      priority={activeReferral.priority}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {activeReferral.referralCode}
                  </p>
                </div>

              </div>

              <StatusBadge status={activeReferral.status} />

            </div>

            {/* Information */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">

              {/* Hospital */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-teal-600" />

                  <p className="text-[10px] font-medium text-slate-400">
                    {t('referrals.referredTo')}
                  </p>
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-900 truncate">
                  {activeReferral.toFacilityName}
                </p>

              </div>

              {/* Department */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

                <div className="flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 text-indigo-600" />

                  <p className="text-[10px] font-medium text-slate-400">
                    {t('referrals.department')}
                  </p>
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-900">
                  {activeReferral.toSpecialty}
                </p>

              </div>

              {/* Appointment */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-600" />

                  <p className="text-[10px] font-medium text-slate-400">
                    Appointment
                  </p>
                </div>

                <p className="mt-1 text-xs font-semibold text-teal-700">
                  {activeReferral.appointmentSlot || 'Not scheduled'}
                </p>

              </div>

            </div>

            {/* Reason */}
            <div className="mt-2 rounded-lg border border-slate-100 bg-white p-3">

              <p className="text-[10px] font-medium text-slate-400">
                {t('referrals.instructions')}
              </p>

              <p className="mt-1 text-xs text-slate-700">
                {activeReferral.reasonForReferral}
              </p>

            </div>

            {/* Button */}
            <Link
              to={`/patient/referrals/${activeReferral.id}`}
              className="mt-3 inline-block"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
              >
                View Full Details
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>

          </CardContent>
        </Card>
      )}

      {/* ================================
          REFERRAL HISTORY
      ================================= */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="border-b border-slate-200 px-4 py-3">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <FileText className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {t('referrals.history')}
              </h2>

              <p className="text-[11px] text-slate-500">
                Your previous referrals
              </p>
            </div>

          </div>

        </div>

        {/* ================================
            DESKTOP TABLE
        ================================= */}
        <div className="hidden md:block overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50 border-b border-slate-200">

              <tr>

                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Referral
                </th>

                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Department
                </th>

                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Hospital
                </th>

                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Date
                </th>

                <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </th>

                <th className="px-4 py-2.5"></th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {referralHistory.map((referral) => (

                <tr
                  key={referral.id}
                  className="hover:bg-slate-50 transition-colors"
                >

                  <td className="px-4 py-3">

                    <Link
                      to={`/patient/referrals/${referral.id}`}
                      className="block"
                    >

                      <p className="text-xs font-semibold text-slate-900">
                        {referral.referralCode}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        Click to view
                      </p>

                    </Link>

                  </td>

                  <td className="px-4 py-3">

                    <p className="text-xs font-medium text-slate-700">
                      {referral.toSpecialty}
                    </p>

                  </td>

                  <td className="px-4 py-3">

                    <p className="max-w-[200px] truncate text-xs text-slate-600">
                      {referral.toFacilityName}
                    </p>

                  </td>

                  <td className="px-4 py-3">

                    <p className="text-xs text-slate-600">
                      {formatDate(referral.createdAt)}
                    </p>

                  </td>

                  <td className="px-4 py-3">

                    <StatusBadge status={referral.status} />

                  </td>

                  <td className="px-4 py-3 text-right">

                    <Link
                      to={`/patient/referrals/${referral.id}`}
                    >
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* ================================
            MOBILE LIST
        ================================= */}
        <div className="md:hidden divide-y divide-slate-100">

          {referralHistory.map((referral) => (

            <Link
              key={referral.id}
              to={`/patient/referrals/${referral.id}`}
              className="block px-4 py-3 hover:bg-slate-50"
            >

              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">

                  <p className="text-xs font-semibold text-slate-900">
                    {referral.referralCode}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500 truncate">
                    {referral.toSpecialty} • {referral.toFacilityName}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {formatDate(referral.createdAt)}
                  </p>

                </div>

                <div className="flex items-center gap-2 shrink-0">

                  <StatusBadge status={referral.status} />

                  <ChevronRight className="h-4 w-4 text-slate-400" />

                </div>

              </div>

            </Link>

          ))}

        </div>

        {/* Empty history */}
        {referralHistory.length === 0 && (
          <div className="px-4 py-8 text-center">

            <FileText className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-2 text-sm font-medium text-slate-600">
              No previous referrals
            </p>

            <p className="text-xs text-slate-400">
              Your referral history will appear here.
            </p>

          </div>
        )}

      </Card>

    </div>
  );
};