import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Settings,
  Sparkles,
} from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import { NotificationItemCard } from '@/components/notification/NotificationItemCard'
import { ActionCenterHeroCard } from '@/components/notification/ActionCenterHeroCard'
import type {
  NotificationItem,
  NotificationCategory,
  ActionCenterItem,
} from '@/types/notification'

type TabType = 'ALL' | 'ACTION_REQUIRED' | NotificationCategory

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function groupNotificationsByPeriod(items: NotificationItem[]): {
  today: NotificationItem[]
  yesterday: NotificationItem[]
  earlier: NotificationItem[]
} {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const today: NotificationItem[] = []
  const yday: NotificationItem[] = []
  const earlier: NotificationItem[] = []

  for (const item of items) {
    const itemDate = new Date(item.timestampIso)
    if (isSameDay(itemDate, now)) {
      today.push(item)
    } else if (isSameDay(itemDate, yesterday)) {
      yday.push(item)
    } else {
      earlier.push(item)
    }
  }

  return { today, yesterday: yday, earlier }
}

export const NotificationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'ALL'

  const [activeTab, setActiveTab] = useState<TabType>(initialTab)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [actionItems, setActionItems] = useState<ActionCenterItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = async () => {
    try {
      const [notifs, actions, count] = await Promise.all([
        notificationService.getNotifications({
          category: activeTab,
          unreadOnly,
        }),
        notificationService.getUnresolvedActions(),
        notificationService.getUnreadCount(),
      ])
      setNotifications(notifs)
      setActionItems(actions)
      setUnreadCount(count)
    } catch {
      // safe fallback
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        const [notifs, actions, count] = await Promise.all([
          notificationService.getNotifications({
            category: activeTab,
            unreadOnly,
          }),
          notificationService.getUnresolvedActions(),
          notificationService.getUnreadCount(),
        ])
        if (isMounted) {
          setNotifications(notifs)
          setActionItems(actions)
          setUnreadCount(count)
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    const unsubscribe = notificationService.subscribe(() => {
      fetchData()
    })
    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [activeTab, unreadOnly])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'ALL') {
      searchParams.delete('tab')
    } else {
      searchParams.set('tab', tab)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id)
    await loadData()
  }

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead()
    await loadData()
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
  }

  const grouped = groupNotificationsByPeriod(notifications)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Page Header & Live Summary */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0F5147] flex items-center justify-center text-white">
              <Bell className="w-4 h-4" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notifications & Action Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F5147] text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time notifications and pending clinical actions across appointments, live queue, lab reports, and care referrals.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#0F5147]" aria-hidden="true" />
              <span>Mark all as read</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl active:scale-95 transition-all shadow-2xs touch-target cursor-pointer"
            title="Refresh notifications"
            aria-label="Refresh notifications"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0F5147]' : ''}`}
              aria-hidden="true"
            />
          </button>

          <Link
            to="/patient/notifications/preferences"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors touch-target"
          >
            <Settings className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span className="hidden sm:inline">Preferences</span>
          </Link>
        </div>
      </section>

      {/* 2. PATIENT ACTION CENTER (Unresolved actionable tasks) */}
      {actionItems.length > 0 && (
        <section aria-labelledby="action-center-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F5147]" aria-hidden="true" />
              <h2
                id="action-center-heading"
                className="text-base font-extrabold text-slate-900 tracking-tight"
              >
                Patient Action Center
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {actionItems.length} pending
              </span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Items resolve automatically when completed
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {actionItems.map((action) => (
              <ActionCenterHeroCard key={action.id} action={action} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Category Tabs & Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
          {/* Scrollable Tabs */}
          <div
            role="tablist"
            aria-label="Notification category filters"
            className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ALL'}
              onClick={() => handleTabChange('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-[#0F5147] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Notifications
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ACTION_REQUIRED'}
              onClick={() => handleTabChange('ACTION_REQUIRED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'ACTION_REQUIRED'
                  ? 'bg-[#0F5147] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Action Required
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'APPOINTMENT'}
              onClick={() => handleTabChange('APPOINTMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'APPOINTMENT'
                  ? 'bg-[#0F5147] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Appointments
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'QUEUE'}
              onClick={() => handleTabChange('QUEUE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'QUEUE'
                  ? 'bg-[#0F5147] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Live Queue
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'REFERRAL'}
              onClick={() => handleTabChange('REFERRAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'REFERRAL'
                  ? 'bg-[#0F5147] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Referrals
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'DIAGNOSTIC'}
              onClick={() => handleTabChange('DIAGNOSTIC')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'DIAGNOSTIC'
                  ? 'bg-[#0F5147] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Diagnostics
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'FOLLOW_UP'}
              onClick={() => handleTabChange('FOLLOW_UP')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'FOLLOW_UP'
                  ? 'bg-[#0F5147] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Follow-ups
            </button>
          </div>

          {/* Unread Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none self-end sm:self-center">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="w-4 h-4 text-[#0F5147] rounded border-slate-300 focus:ring-[#0F5147] cursor-pointer"
            />
            <span>Unread Only</span>
          </label>
        </div>

        {/* 4. Notification Items Feed */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0F5147] animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-600">Loading healthcare notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {unreadOnly ? 'No unread notifications' : 'No notifications in this category'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              All healthcare notices are synchronized with your active appointments, laboratory orders, hospital referrals, and follow-up plans.
            </p>
            {unreadOnly && (
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today's Section */}
            {grouped.today.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Today
                  </h3>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                <div className="space-y-3">
                  {grouped.today.map((item) => (
                    <NotificationItemCard
                      key={item.id}
                      notification={item}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday's Section */}
            {grouped.yesterday.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Yesterday
                  </h3>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                <div className="space-y-3">
                  {grouped.yesterday.map((item) => (
                    <NotificationItemCard
                      key={item.id}
                      notification={item}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Earlier Section */}
            {grouped.earlier.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Earlier
                  </h3>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                <div className="space-y-3">
                  {grouped.earlier.map((item) => (
                    <NotificationItemCard
                      key={item.id}
                      notification={item}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
