import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { apiClient } from '../../lib/api-client'

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiClient.post('/password-reset/request', { email })
      setSent(true)
    } catch {
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFCFF] p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/">
            <img src="/assets/dentiqly-logo-blue.png" alt="Dentiqly" className="h-8 w-auto mx-auto mb-6" />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0B1023] mb-1">Recuperar contraseña</h1>
          <p className="text-[#8A93A8] text-sm">
            {sent ? 'Revisá tu bandeja de entrada' : 'Ingresá tu email y te enviaremos un enlace'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-[#22C55E]" />
              </div>
              <p className="text-sm text-[#4B5568] mb-6 leading-relaxed">
                Si el email está registrado, recibirás un enlace para restablecer tu contraseña. Revisá también la carpeta de spam.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#2563FF] font-bold text-sm hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B1023] mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[#8A93A8]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-3 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563FF] text-white py-3.5 px-6 rounded-none font-bold text-sm hover:bg-[#1D4ED8] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar enlace de recuperación'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-[#8A93A8] hover:text-[#2563FF] transition-colors">
            <ArrowLeft className="h-3 w-3 inline mr-1" />
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}
