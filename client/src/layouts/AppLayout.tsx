import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { Sidebar } from '@/components/common/Sidebar'
import { OfflineBanner } from '@/components/common/OfflineBanner'

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Offline Alert Bar */}
      <OfflineBanner />

      {/* Main App Header */}
      <Header />

      {/* Body Container: Sidebar + Scrollable Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full focus:outline-none"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {/* App Footer */}
      <Footer />
    </div>
  )
}
