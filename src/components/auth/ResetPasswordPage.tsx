import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { apiClient } from '../../lib/api-client'

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await apiClient.post('/password-reset/reset', { token, password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFCFF] p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#0B1023] mb-2">Enlace inválido</h1>
          <p className="text-sm text-[#8A93A8] mb-4">El enlace de recuperación no es válido o ha expirado.</p>
          <Link to="/forgot-password" className="text-[#2563FF] font-bold text-sm hover:underline">
            Solicitar un nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFCFF] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/">
            <img src="/assets/dentiqly-logo-blue.png" alt="Dentiqly" className="h-8 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0B1023] mb-1">Nueva contraseña</h1>
          <p className="text-[#8A93A8] text-sm">Ingresá tu nueva contraseña</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-[#22C55E]" />
              </div>
              <p className="text-sm text-[#4B5568] mb-2">Contraseña actualizada exitosamente.</p>
              <p className="text-xs text-[#8A93A8]">Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-full text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0B1023] mb-1.5 uppercase tracking-wider">Nueva contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#8A93A8]" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-3 text-sm bg-[#F7F8FA] border border-transparent rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1023] mb-1.5 uppercase tracking-wider">Confirmar contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#8A93A8]" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="block w-full pl-9 pr-3 py-3 text-sm bg-[#F7F8FA] border border-transparent rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                    placeholder="Repetí la contraseña"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563FF] text-white py-3.5 px-6 rounded-full font-bold text-sm hover:bg-[#1D4ED8] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar contraseña'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
