import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Smartphone,
  ShieldCheck,
  Check,
  Calendar,
  Clock,
  Share2,
  Activity,
  Pill,
  RotateCcw,
  Lock,
} from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import type { NotificationPreferences } from '@/types/notification'

export const NotificationPreferencesPage: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    notificationService.getPreferences()
  )
  const [savedNotice, setSavedNotice] = useState(false)
  const [isRequestingPush, setIsRequestingPush] = useState(false)

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(() => {
      setPrefs(notificationService.getPreferences())
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    if (key === 'emergencyAlerts') return // Safety lock

    const updated = notificationService.savePreferences({ [key]: value })
    setPrefs(updated)
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  const handleRequestPush = async () => {
    setIsRequestingPush(true)
    try {
      await notificationService.requestPushPermission()
      setPrefs(notificationService.getPreferences())
      setSavedNotice(true)
      setTimeout(() => setSavedNotice(false), 2500)
    } finally {
      setIsRequestingPush(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/patient/notifications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5147] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notifications</span>
        </Link>

        {savedNotice && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preferences saved</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Notification Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Control how HealthConnect delivers time-sensitive alerts, queue notifications, and clinical care updates to you.
        </p>
      </div>

      {/* 1. Delivery Channels Card */}
      <section
        aria-labelledby="channels-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] border border-[#D0EAE6] flex items-center justify-center text-[#0F5147]">
            <Smartphone className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 id="channels-heading" className="text-base font-bold text-slate-900">
              Delivery Channels
            </h2>
            <p className="text-xs text-slate-500">
              Choose the channels on which you wish to receive notifications.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 space-y-1">
          {/* In-App Notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5 max-w-lg">
              <span className="text-sm font-semibold text-slate-900 block">
                In-App Action Center & Bell
              </span>
              <p className="text-xs text-slate-500">
                Receive notifications in the top navigation header and Action Center dashboard.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.inAppEnabled}
                onChange={(e) => updatePreference('inAppEnabled', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle In-App Action Center notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* SMS Updates */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  SMS / Mobile Alerts
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                  +91 98765 43210
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Receive critical token arrival reminders and hospital referral updates via official telecom SMS gateways.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.smsEnabled}
                onChange={(e) => updatePreference('smsEnabled', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle SMS alerts"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5 max-w-lg">
              <span className="text-sm font-semibold text-slate-900 block">
                Email Summaries
              </span>
              <p className="text-xs text-slate-500">
                Receive comprehensive lab report downloads and appointment confirmation slips.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.emailEnabled}
                onChange={(e) => updatePreference('emailEnabled', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle Email summaries"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* Web / Browser Push Notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  Browser Push Notifications
                </span>
                {prefs.browserPermissionStatus === 'granted' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    Active
                  </span>
                ) : prefs.browserPermissionStatus === 'denied' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-full border border-red-200">
                    Blocked in browser
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPush}
                    disabled={isRequestingPush}
                    className="text-[11px] font-semibold text-[#0F5147] hover:underline cursor-pointer"
                  >
                    Enable browser permission
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Instant desktop or phone notifications when your token is called or lab results are released.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.pushEnabled}
                disabled={prefs.browserPermissionStatus === 'denied'}
                onChange={(e) => {
                  if (prefs.browserPermissionStatus !== 'granted') {
                    handleRequestPush()
                  } else {
                    updatePreference('pushEnabled', e.target.checked)
                  }
                }}
                className="sr-only peer disabled:opacity-50"
                aria-label="Toggle Browser Push notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>
        </div>
      </section>

      {/* 2. Category Subscriptions Card */}
      <section
        aria-labelledby="categories-heading"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-[#F2F9F8] border border-[#D0EAE6] flex items-center justify-center text-[#0F5147]">
            <Bell className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 id="categories-heading" className="text-base font-bold text-slate-900">
              Healthcare Event Subscriptions
            </h2>
            <p className="text-xs text-slate-500">
              Customize alerts for specific stages in your longitudinal care pathway.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 space-y-1">
          {/* Emergency Alerts - Non-Negotiable Clinical Safety Rule */}
          <div className="flex items-center justify-between py-3 bg-red-50/50 p-3 rounded-xl border border-red-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-950">
                    Emergency Alerts & Critical Traumas
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-red-100 text-red-900 rounded-full border border-red-300">
                    <Lock className="w-3 h-3" /> Mandatory Safety Policy
                  </span>
                </div>
                <p className="text-xs text-red-800/80">
                  Critical medical dispatches, urgent hospital transfer re-routing, and trauma advisories cannot be silenced.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-red-900 px-2 py-1 bg-white rounded-lg border border-red-200">
              Always Active
            </span>
          </div>

          {/* Queue Tokens */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900 block">
                  Live OPD Queue & Token Approaching
                </span>
                <p className="text-xs text-slate-500">
                  Alerts when your turn is approaching or your token is called by the clinician.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.queueTokens}
                onChange={(e) => updatePreference('queueTokens', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle Live OPD Queue notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* Appointments */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#F2F9F8] text-[#0F5147] shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900 block">
                  Appointments & Consultation Reminders
                </span>
                <p className="text-xs text-slate-500">
                  Confirmations, reschedule notices, and morning-of reminders for OPD visits.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.appointments}
                onChange={(e) => updatePreference('appointments', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle Appointment notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* Referrals */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0 mt-0.5">
                <Share2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900 block">
                  Hospital Referrals & Inter-Facility Transfers
                </span>
                <p className="text-xs text-slate-500">
                  Acceptance by receiving hospital, specialist assignment, and transfer requirements.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.referrals}
                onChange={(e) => updatePreference('referrals', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle Hospital Referral notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* Diagnostics */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-700 shrink-0 mt-0.5">
                <Activity className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900 block">
                  Diagnostics & Laboratory Reports
                </span>
                <p className="text-xs text-slate-500">
                  Sample collection schedules and verified pathology or radiology report releases.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.diagnostics}
                onChange={(e) => updatePreference('diagnostics', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle Diagnostics notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* Follow-ups */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900 block">
                  Ongoing Care & Follow-Up Reminders
                </span>
                <p className="text-xs text-slate-500">
                  Reminders when chronic care or post-operative consultation milestones become due.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.followUps}
                onChange={(e) => updatePreference('followUps', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle Follow-up notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>

          {/* Prescriptions */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0 mt-0.5">
                <Pill className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-900 block">
                  Prescriptions & Generic Medicine Availability
                </span>
                <p className="text-xs text-slate-500">
                  Updates on Jan Aushadhi generic availability and pharmacy dispensing receipts.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.prescriptions}
                onChange={(e) => updatePreference('prescriptions', e.target.checked)}
                className="sr-only peer"
                aria-label="Toggle Prescription notifications"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5147]" />
            </label>
          </div>
        </div>
      </section>
    </main>
  )
}
