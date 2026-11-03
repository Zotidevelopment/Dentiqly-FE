import { AuthBrandPanel } from '../brand/AuthBrandPanel'
import { BrandLogo } from '../brand/BrandLogo'
import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { patientPortalApi, setPatientToken, getPatientToken } from "../../api/patient-portal"
import { Shield, ArrowRight, Mail, Lock, Loader2, } from "lucide-react"

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
      setError(err.message || "Credenciales inválidas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dentiqly-auth min-h-screen flex items-stretch">
      <AuthBrandPanel title={"Tu próxima consulta empieza acá."} description={"Consultá tus turnos, tus tratamientos y la información que comparte tu clínica, desde un mismo lugar."} />

      {/* Right — Login form */}
      <div className="dentiqly-auth-form w-full lg:w-[56%] flex items-center justify-center p-8 sm:p-12 bg-[#FAFCFF]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <Link to="/">
              <BrandLogo alt="Dentiqly" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#0B2440] mb-2">Portal del paciente</h1>
            <p className="text-[#8A93A8] font-medium">Ingresá con tu correo y DNI para acceder</p>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
            <div className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="patient-email" className="block text-xs font-bold text-[#0B2440] mb-2 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4.5 w-4.5 text-[#8A93A8]" />
                    </div>
                    <input
                      id="patient-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2458ED]/20 focus:border-[#2458ED] focus:bg-white transition-all text-[#0B2440] text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="patient-dni" className="block text-xs font-bold text-[#0B2440] mb-2 uppercase tracking-wider">
                    DNI (Contraseña)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-[#8A93A8]" />
                    </div>
                    <input
                      id="patient-dni"
                      type="password"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      required
                      className="block w-full pl-12 pr-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2458ED]/20 focus:border-[#2458ED] focus:bg-white transition-all text-[#0B2440] text-sm"
                      placeholder="Tu número de DNI"
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
                  className="w-full bg-[#2458ED] text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-[#1744CD] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.25)] hover:shadow-[0_12px_30px_rgba(37,99,255,0.35)] disabled:opacity-50 flex items-center justify-center gap-2.5 mt-2"
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
                Tu cuenta se crea automáticamente al reservar un turno en una clínica que usa Dentiqly.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[#8A93A8] text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Conexión segura y encriptada</span>
          </div>
        </div>
      </div>
    </div>
  )
}
