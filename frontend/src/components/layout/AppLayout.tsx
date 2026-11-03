import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { CompareDrawer } from '../repository/CompareDrawer'
import { NotificationToast } from '../common/NotificationToast'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#09090B] text-zinc-900 dark:text-zinc-100 selection:bg-violet-500 selection:text-white transition-colors duration-200">
      <Navbar />

      {isLandingPage ? (
        <main className="flex-1">
          <Outlet />
        </main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      )}

      {isLandingPage && <Footer />}

      <CompareDrawer />
      <NotificationToast />
    </div>
  )
}
