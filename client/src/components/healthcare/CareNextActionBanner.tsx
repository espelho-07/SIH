import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react'
import type { NextActionGuidance } from '@/types/record'

export interface CareNextActionBannerProps {
  guidance: NextActionGuidance
  className?: string
}

export const CareNextActionBanner: React.FC<CareNextActionBannerProps> = ({
  guidance,
  className = '',
}) => {
  const isHigh = guidance.urgency === 'HIGH'
  const isMedium = guidance.urgency === 'MEDIUM'

  return (
    <section
      role="region"
      aria-label="Next Best Action for Your Healthcare Journey"
      className={`relative overflow-hidden rounded-2xl border transition-all duration-200 shadow-sm ${
        isHigh
          ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-emerald-500/10 border-amber-300/80 dark:border-amber-600/50'
          : isMedium
            ? 'bg-gradient-to-r from-sky-500/10 via-blue-500/5 to-indigo-500/10 border-sky-300/80 dark:border-sky-600/50'
            : 'bg-gradient-to-r from-slate-100 via-emerald-50/40 to-slate-50 border-slate-200 dark:border-slate-800'
      } ${className}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Content Block */}
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl flex-shrink-0 ${
                isHigh
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : isMedium
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              {isHigh ? (
                <ShieldAlert className="w-6 h-6" aria-hidden="true" />
              ) : isMedium ? (
                <Clock className="w-6 h-6" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                    isHigh
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                      : isMedium
                        ? 'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  Next Best Action
                </span>

                {guidance.dueTimeContext && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {guidance.dueTimeContext}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                {guidance.title}
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                {guidance.description}
              </p>
            </div>
          </div>

          {/* Action CTA button */}
          <div className="flex-shrink-0 pt-2 md:pt-0">
            {guidance.targetRoute.startsWith('#') ? (
              <a
                href={guidance.targetRoute}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm active:scale-98 ${
                  isHigh
                    ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
                    : isMedium
                      ? 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white focus:ring-emerald-600'
                }`}
              >
                <span>{guidance.ctaText}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to={guidance.targetRoute}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm active:scale-98 ${
                  isHigh
                    ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
                    : isMedium
                      ? 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white focus:ring-emerald-600'
                }`}
              >
                <span>{guidance.ctaText}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
