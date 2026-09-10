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
      className={`relative overflow-hidden rounded-2xl border transition-all duration-200 shadow-2xs ${
        isHigh
          ? 'bg-amber-50/50 border-amber-200'
          : isMedium
            ? 'bg-sky-50/50 border-sky-200'
            : 'bg-[#F2F9F8] border-[#D0EAE6]'
      } ${className}`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Content Block */}
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl flex-shrink-0 ${
                isHigh
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isMedium
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-[#0F5147] text-white shadow-xs'
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
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : isMedium
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : 'bg-[#F2F9F8] text-[#0F5147] border border-[#D0EAE6]'
                  }`}
                >
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  Next Best Action
                </span>

                {guidance.dueTimeContext && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    {guidance.dueTimeContext}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {guidance.title}
              </h2>

              <p className="text-sm text-slate-700 max-w-3xl leading-relaxed">
                {guidance.description}
              </p>
            </div>
          </div>

          {/* Action CTA button */}
          <div className="flex-shrink-0 pt-2 md:pt-0">
            {guidance.targetRoute.startsWith('#') ? (
              <a
                href={guidance.targetRoute}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-xs active:scale-98 ${
                  isHigh
                    ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
                    : isMedium
                      ? 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500'
                      : 'bg-[#0F5147] hover:bg-[#0A3F37] text-white focus:ring-[#0F5147]'
                }`}
              >
                <span>{guidance.ctaText}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to={guidance.targetRoute}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-xs active:scale-98 ${
                  isHigh
                    ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
                    : isMedium
                      ? 'bg-sky-600 hover:bg-sky-700 text-white focus:ring-sky-500'
                      : 'bg-[#0F5147] hover:bg-[#0A3F37] text-white focus:ring-[#0F5147]'
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
