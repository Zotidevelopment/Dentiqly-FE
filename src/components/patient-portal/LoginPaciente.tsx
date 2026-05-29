import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { patientPortalApi, setPatientToken, getPatientToken } from "../../api/patient-portal"
import { Shield, ArrowRight, Mail, Lock, Loader2, CheckCircle2, Calendar, FileText, Clock } from "lucide-react"

export const LoginPaciente: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [dni, setDni] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = getPatientToken()
    if (token) {
      navigate("/paciente/dashboard")
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await patientPortalApi.login(email, dni)
      setPatientToken(response.token)
      navigate("/paciente/dashboard")
    } catch (err: any) {
      setError(err.message || "Credenciales invalidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left — Dark branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1023] relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-[#02E3FF]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[#2563FF]/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <img src="/assets/dentiqly-logo-white.png?v=2" alt="Dentiqly" className="h-10 w-auto" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Tu salud dental, siempre al alcance.
          </h2>
          <p className="text-white/40 text-lg leading-relaxed mb-10">
            Accede a tus turnos, historial clinico y archivos desde cualquier lugar, en cualquier momento.
          </p>

          <div className="space-y-4">
            {[
              { icon: Calendar, text: 'Consulta y gestiona tus proximos turnos' },
              { icon: FileText, text: 'Accede a tu historial clinico completo' },
              { icon: Clock, text: 'Seguimiento de tratamientos en curso' },
              { icon: Shield, text: 'Tus datos protegidos y encriptados' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02E3FF]/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#02E3FF]" />
                </div>
                <span className="text-white/60 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="p-5 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            <p className="text-white/70 text-sm italic mb-3">
              "Puedo ver mis proximos turnos y mi historial desde el celular. Es super practico y facil de usar."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#02E3FF] to-[#2563FF] flex items-center justify-center">
                <span className="text-white text-xs font-bold">MG</span>
              </div>
              <div>
                <p className="text-white/80 text-sm font-semibold">Maria Gonzalez</p>
                <p className="text-white/30 text-xs">Paciente — Buenos Aires</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-[#FAFCFF]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <Link to="/">
              <img src="/assets/dentiqly-logo.png?v=2" alt="Dentiqly" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#0B1023] mb-2">Portal del Paciente</h1>
            <p className="text-[#8A93A8] font-medium">Ingresa con tu email y DNI para acceder</p>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
            <div className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#0B1023] mb-2 uppercase tracking-wider">
                    Correo Electronico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-[#8A93A8]" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023] text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1023] mb-2 uppercase tracking-wider">
                    DNI (Contrasena)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-[#8A93A8]" />
                    </div>
                    <input
                      type="password"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023] text-sm"
                      placeholder="Tu numero de DNI"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563FF] text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.25)] hover:shadow-[0_12px_30px_rgba(37,99,255,0.35)] disabled:opacity-50 flex items-center justify-center gap-2.5 mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      Ingresar a mi portal
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="px-8 py-5 bg-[#F7F8FA] border-t border-gray-100 text-center">
              <p className="text-sm text-[#8A93A8]">
                Tu cuenta se crea automaticamente al reservar un turno en una clinica Dentiqly.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[#8A93A8] text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Conexion segura y encriptada</span>
          </div>
        </div>
      </div>
    </div>
  )
}
