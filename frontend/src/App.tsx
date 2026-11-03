import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ComparisonProvider } from './context/ComparisonContext'
import { AppLayout } from './components/layout/AppLayout'

// Pages
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { DiscoverPage } from './pages/DiscoverPage'
import { RepositoryDetailsPage } from './pages/RepositoryDetailsPage'
import { ComparePage } from './pages/ComparePage'
import { SearchHistoryPage } from './pages/SearchHistoryPage'
import { SettingsPage } from './pages/SettingsPage'

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ComparisonProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/repository/:id" element={<RepositoryDetailsPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/history" element={<SearchHistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ComparisonProvider>
    </ThemeProvider>
  )
}

export default App
