import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { Sidebar } from '@/components/common/Sidebar'
import { BottomNav } from '@/components/common/BottomNav'
import { OfflineBanner } from '@/components/common/OfflineBanner'
import { HealthcareAssistantDrawer } from '@/components/assistant/HealthcareAssistantDrawer'
import { useUiStore } from '@/stores/uiStore'

export const AppLayout: React.FC = () => {
  const isVoiceModalOpen = useUiStore((state) => state.isVoiceModalOpen)
  const setVoiceModalOpen = useUiStore((state) => state.setVoiceModalOpen)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
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
          className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-full focus:outline-none pb-24 lg:pb-8"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>

      {/* App Footer */}
      <Footer />

      {/* Mobile-first Bottom Navigation */}
      <BottomNav />

      {/* Global AI & Voice Healthcare Assistant Drawer */}
      <HealthcareAssistantDrawer
        isOpen={isVoiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  )
}

