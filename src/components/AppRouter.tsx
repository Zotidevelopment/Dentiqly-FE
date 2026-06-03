import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}
import { dentalColors } from '../config/colors'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../lib/api-client'

// Import components
import { BookingForm } from './booking/BookingForm'
import { AdminApp } from './admin/AdminApp'
import { PatientApp } from './patient-portal/PatientApp'
import { LandingPage } from './landing/LandingPage'
import { LoginPage } from './auth/LoginPage'
import { RegisterPage } from './auth/RegisterPage'
import { ForgotPasswordPage } from './auth/ForgotPasswordPage'
import { ResetPasswordPage } from './auth/ResetPasswordPage'
import { SuperAdminApp } from './superadmin/SuperAdminApp'
import { PrivacyPage } from './legal/PrivacyPage'
import { TermsPage } from './legal/TermsPage'
import { CookiesPage } from './legal/CookiesPage'
import { AboutPage } from './legal/AboutPage'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF]"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    const isSuperAdmin = user.email === 'riostiziano6@gmail.com'
    if (isSuperAdmin && allowedRoles.includes('superadmin')) {
      return <>{children}</>
    }
    const slug = user.clinica?.slug
    if (slug) {
      return <Navigate to={`/${slug}/admin`} replace />
    }
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * Header de branding Dentiqly para las páginas de booking público.
 */
const DentiqlyBookingHeader: React.FC = () => (
  <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
      <span className="text-[10px] sm:text-xs font-semibold text-gray-400 tracking-widest uppercase">
        Reserva online
      </span>
      <div className="flex items-center gap-3">
        <img
          src="/assets/dentiqly-logo.png"
          alt="Dentiqly - Dental Software SaaS"
          className="h-8 sm:h-9 w-auto object-contain"
        />
      </div>
    </div>
  </header>
)

/**
 * BookingLayout con slug del tenant.
 * Setea el tenantSlug en el apiClient para que todas las llamadas
 * del wizard de booking vayan a /api/public/:slug/
 */
const BookingWithSlug: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (slug) {
      apiClient.setTenantSlug(slug)
      setIsReady(true)
    }
    return () => {
      apiClient.setTenantSlug(null)
      setIsReady(false)
    }
  }, [slug])

  if (!slug) {
    return <Navigate to="/" replace />
  }

  if (!isReady) {
    return null // Retrasar el renderizado hasta que el tenantSlug esté configurado
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: dentalColors.gray50 }}>
      <DentiqlyBookingHeader />
      <main className="flex-1 py-8">
        <BookingForm />
      </main>
    </div>
  )
}

const BookingLayout: React.FC = () => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Fallback inteligente para la ruta legacy /reserva
    // Intentar sacar el slug del usuario logueado si existe
    const userStr = localStorage.getItem("user")
    const user = userStr ? JSON.parse(userStr) : null
    
    // El slug puede estar en user.clinica.slug (de me()) o user.clinica_slug si lo mapeamos
    const userSlug = user?.clinica?.slug || user?.clinica_slug
    
    if (userSlug) {
      apiClient.setTenantSlug(userSlug)
    }
    setIsReady(true)
    
    return () => {
      apiClient.setTenantSlug(null)
      setIsReady(false)
    }
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: dentalColors.gray50 }}>
      <DentiqlyBookingHeader />
      <main className="flex-1 py-8">
        <BookingForm />
      </main>
    </div>
  )
}



export const AppRouter: React.FC = () => {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/privacidad" element={<PrivacyPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/sobre-nosotros" element={<AboutPage />} />
      
      {/* Legacy booking sin slug */}
      <Route path="/reserva" element={<BookingLayout />} />

      {/* Super Admin Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SuperAdminApp />
          </ProtectedRoute>
        }
      />

      {/* Tenant Admin Protected Routes */}
      <Route
        path="/:slug/admin/*"
        element={
          <ProtectedRoute>
            <AdminApp />
          </ProtectedRoute>
        }
      />

      <Route path="/paciente/*" element={<PatientApp />} />

      {/* Demo Admin Route */}
      <Route path="/demo/*" element={<AdminApp />} />

      {/* Booking público por slug — debe ir después de todas las rutas estáticas */}
      <Route path="/:slug" element={<BookingWithSlug />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}