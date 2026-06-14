"use client"

import React, { useState, useEffect } from "react"
import { ServiceSelection } from "./ServiceSelection"
import { ProfessionalSelection } from "./ProfessionalSelection"
import { DateTimeSelection } from "./DateTimeSelection"
import { PatientForm } from "./PatientForm"
import { PaymentStep } from "./PaymentStep"
import { BookingSuccess } from "./BookingSuccess"
import { BookingSummary } from "./BookingSummary"
import type { Servicio, Profesional, CrearPacienteData } from "../../types"
import { turnosApi, pacientesApi } from "../../api"
import { patientPortalApi, getPatientToken } from "../../api/patient-portal"
import { configuracionApi } from "../../api/configuracion"
import { BranchSelection } from "./BranchSelection"
import { Check, ArrowLeft, MapPin, Calendar } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

export const BookingForm: React.FC = () => {
  const [step, setStep] = useState(1)
  const [selectedBranch, setSelectedBranch] = useState<any | null>(null)
  const [selectedService, setSelectedService] = useState<Servicio | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Profesional | null>(null)
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<CrearPacienteData | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mesActualBloqueado, setMesActualBloqueado] = useState(false)
  const [senaEnabled, setSenaEnabled] = useState(false)
  const [senaMonto, setSenaMonto] = useState(0)
  
  // Settings configurations
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(true)
  const [loadingSettings, setLoadingSettings] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoadingSettings(true)
        const settings = await configuracionApi.listar()
        let bookingEnabledVal = true
        settings.forEach(s => {
          if (s.clave === "sena_enabled") setSenaEnabled(s.valor === true || s.valor === "true")
          if (s.clave === "sena_monto") setSenaMonto(Number(s.valor) || 0)
          if (s.clave === "online_booking_enabled") {
            bookingEnabledVal = s.valor === true || s.valor === "true"
          }
        })
        setOnlineBookingEnabled(bookingEnabledVal)
      } catch (e) {
        console.error("Error fetching sena config:", e)
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la configuración del sistema" })
      } finally {
        setLoadingSettings(false)
      }
    }
    fetchConfigs()
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const token = getPatientToken()
      if (token) {
        try {
          const perfil = await patientPortalApi.obtenerPerfil()
          if (perfil.paciente) {
            setIsAuthenticated(true)
            const paciente = perfil.paciente
            setPatientData({
              nombre: paciente.nombre,
              apellido: paciente.apellido,
              tipo_documento: paciente.tipo_documento as 'DNI' | 'Pasaporte' | 'Cédula',
              numero_documento: paciente.numero_documento,
              fecha_nacimiento: paciente.fecha_nacimiento,
              sexo: paciente.sexo as 'Masculino' | 'Femenino' | 'Otro',
              email: paciente.email,
              telefono: paciente.telefono,
              direccion: paciente.direccion || "",
              observaciones: "",
            })
            
            const turnos = await patientPortalApi.obtenerMisTurnos()
            const today = new Date()
            const currentMonth = today.getMonth()
            const currentYear = today.getFullYear()
            const tieneTurnoEsteMes = turnos.some((t: any) => {
              const fechaTurno = new Date(t.fecha)
              return fechaTurno.getMonth() === currentMonth && 
                     fechaTurno.getFullYear() === currentYear &&
                     t.estado !== 'Cancelado'
            })
            setMesActualBloqueado(tieneTurnoEsteMes)
          }
        } catch (e) {
          console.error("Error al obtener perfil:", e)
          localStorage.removeItem("patientToken")
          setIsAuthenticated(false)
          toast({ variant: "destructive", title: "Sesión expirada", description: "Tu sesión expiró. Completá tus datos nuevamente." })
        }
      }
    }
    checkAuth()
  }, [])

  const handleBranchSelect = (branch: any) => {
    setSelectedBranch(branch)
    setStep(2)
  }

  const handleServiceSelect = (service: Servicio) => {
    setSelectedService(service)
    setStep(3)
  }

  const handleProfessionalSelect = (professional: Profesional) => {
    setSelectedProfessional(professional)
    setStep(4)
  }

  const handleDateTimeSelect = (dateTime: string) => {
    setSelectedDateTime(dateTime)
    if (isAuthenticated && patientData) {
      setStep(senaEnabled ? 6 : 5)
    } else {
      setStep(5)
    }
  }

  const handlePatientSubmit = (data: CrearPacienteData) => {
    setPatientData(data)
    setStep(6)
  }

  const handleFinalSubmit = async () => {
    if (!selectedService || !selectedProfessional || !selectedDateTime || !patientData || !selectedBranch) return

    setLoading(true)
    try {
      let pacienteId: string
      const existingPatient = await pacientesApi.buscarPorDocumento(patientData.numero_documento)

      if (existingPatient) {
        pacienteId = existingPatient.id
      } else {
        const newPatient = await pacientesApi.crear(patientData)
        pacienteId = newPatient.id
      }

      const horaInicio = selectedDateTime.split('T')[1].substring(0, 5)
      const [hours, minutes] = horaInicio.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + (selectedService.duracion_estimada || 30)
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const horaFin = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

      const turnoResponse = await turnosApi.crear({
        paciente_id: pacienteId,
        profesional_id: selectedProfessional.id,
        servicio_id: selectedService.id,
        sucursal_id: selectedBranch?.id, // <--- Added sucursal_id
        fecha: selectedDateTime.split('T')[0],
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        estado: "Pendiente",
        pago_confirmado: false,
      })

      setBookingId(turnoResponse.id)
      setBookingSuccess(true)
    } catch (error: any) {
      console.error("Error creating appointment:", error)
      const message = error.response?.data?.error || "Error al crear el turno. Por favor, intente nuevamente."
      toast({ variant: "destructive", title: "Error", description: message })
    } finally {
      setLoading(false)
    }
  }

  const resetBooking = () => {
    setStep(1)
    setSelectedBranch(null)
    setSelectedService(null)
    setSelectedProfessional(null)
    setSelectedDateTime(null)
    setBookingSuccess(false)
    setBookingId(null)
    if (!isAuthenticated) setPatientData(null)
  }

  if (loadingSettings) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563FF]"></div>
      </div>
    )
  }

  if (!onlineBookingEnabled) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl my-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-amber-50/80 flex items-center justify-center mb-6 text-amber-500 border border-amber-100">
          <Calendar className="w-8 h-8" strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Agendamiento Online Desactivado</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-md">
          El agendamiento directo de turnos online por parte de los pacientes está inhabilitado. 
          Por favor, comuníquese directamente con la recepción de la clínica (por teléfono o WhatsApp) para coordinar y reservar su turno.
        </p>
      </div>
    )
  }

  if (bookingSuccess && selectedService && selectedProfessional && selectedDateTime) {
    return (
      <BookingSuccess
        appointmentData={{
          service: selectedService.nombre,
          professional: `${selectedProfessional.nombre} ${selectedProfessional.apellido}`,
          dateTime: selectedDateTime,
          patientName: patientData ? `${patientData.nombre} ${patientData.apellido}` : "",
          patientPhone: patientData?.telefono || "",
          patientEmail: patientData?.email || "",
          patientDni: patientData?.numero_documento || "",
        }}
        onNewBooking={resetBooking}
      />
    )
  }

  const formatDateTimeSummary = (dt: string) => {
    const d = new Date(dt)
    return `${d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}hs`
  }

  const getStepSummary = (stepIndex: number) => {
    switch (stepIndex) {
      case 1: return selectedBranch?.nombre || "Seleccionar"
      case 2: return selectedService?.nombre || "Seleccionar"
      case 3: return selectedProfessional ? `${selectedProfessional.nombre} ${selectedProfessional.apellido}` : "Seleccionar"
      case 4: return selectedDateTime ? formatDateTimeSummary(selectedDateTime) : "Seleccionar"
      case 5: return patientData ? `${patientData.nombre} ${patientData.apellido}` : "Completar datos"
      case 6: return "Pendiente"
      default: return ""
    }
  }

  const stepTitles = senaEnabled
    ? [
        "SELECCIÓN DE SUCURSAL",
        "SELECCIÓN DE SERVICIO",
        "SELECCIÓN DE PROFESIONAL",
        "FECHA Y HORA",
        "DATOS PERSONALES",
        "PAGO DE SEÑA"
      ]
    : [
        "SELECCIÓN DE SUCURSAL",
        "SELECCIÓN DE SERVICIO",
        "SELECCIÓN DE PROFESIONAL",
        "FECHA Y HORA",
        "DATOS PERSONALES",
        "CONFIRMAR TURNO"
      ]

  return (
    <div className="h-screen bg-[#f8fafc] font-sans selection:bg-blue-100 selection:text-[#026498] flex flex-col overflow-hidden">
      <div className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 h-full overflow-hidden">
          {/* Main Content: Accordion Steps */}
          <div className="lg:col-span-8 space-y-3 overflow-y-auto pr-1 no-scrollbar">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1
              const isCompleted = step > stepNumber
              const isActive = step === stepNumber
              const isFuture = step < stepNumber

              return (
                <div 
                  key={stepNumber}
                  className={`bg-white rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
                    isActive ? "border-[#2563FF] shadow-lg shadow-[#2563FF]/10" : 
                    isCompleted ? "border-gray-200 hover:border-blue-300 cursor-pointer" : "border-gray-100 opacity-60"
                  }`}
                  onClick={() => {
                    if (isCompleted) setStep(stepNumber)
                  }}
                >
                  {/* Step Header */}
                  <div className={`p-5 sm:p-6 flex items-center justify-between ${isActive ? "border-b border-gray-100" : ""}`}>
                    <div className="flex items-center gap-4">
                      {isCompleted ? (
                        <div className="w-8 h-8 rounded-full bg-[#2563FF] text-white flex items-center justify-center">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      ) : isActive ? (
                        <div className="w-8 h-8 rounded-full bg-[#2563FF] text-white flex items-center justify-center font-bold text-sm">
                          {stepNumber}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
                          {stepNumber}
                        </div>
                      )}
                      <h3 className={`font-bold text-sm sm:text-base tracking-wide ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                        {title}
                      </h3>
                    </div>
                    {isCompleted && !isActive && (
                      <span className="text-sm font-bold text-[#2563FF]">
                        {getStepSummary(stepNumber)}
                      </span>
                    )}
                  </div>

                  {/* Step Content (Expanded) */}
                  {isActive && (
                    <div className="p-5 sm:p-8 animate-in slide-in-from-top-4 duration-500">
                      {step === 1 && <BranchSelection onBranchSelect={handleBranchSelect} selectedBranch={selectedBranch} />}
                      {step === 2 && <ServiceSelection onServiceSelect={handleServiceSelect} selectedService={selectedService} />}
                      {step === 3 && (
                        <ProfessionalSelection
                          selectedService={selectedService}
                          onProfessionalSelect={handleProfessionalSelect}
                          selectedProfessional={selectedProfessional}
                        />
                      )}
                      {step === 4 && selectedProfessional && (
                        <DateTimeSelection
                          selectedService={selectedService}
                          selectedProfessional={selectedProfessional}
                          onDateTimeSelect={handleDateTimeSelect}
                          selectedDateTime={selectedDateTime}
                          mesActualBloqueado={mesActualBloqueado}
                        />
                      )}
                      {step === 5 && (
                        <PatientForm
                          onPatientData={handlePatientSubmit}
                          loading={loading}
                        />
                      )}
                      {step === 6 && selectedService && selectedProfessional && selectedDateTime && patientData && (
                        senaEnabled ? (
                          <PaymentStep
                            service={selectedService}
                            professional={selectedProfessional}
                            dateTime={selectedDateTime}
                            patientData={patientData}
                            loading={loading}
                            onConfirm={handleFinalSubmit}
                            senaMonto={senaMonto}
                          />
                        ) : (
                          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-3">
                              <p className="text-sm font-bold text-gray-900">Resumen de tu turno</p>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-semibold">Servicio:</span> {selectedService.nombre}</p>
                                <p><span className="font-semibold">Profesional:</span> {selectedProfessional.nombre} {selectedProfessional.apellido}</p>
                                <p><span className="font-semibold">Paciente:</span> {patientData.nombre} {patientData.apellido}</p>
                              </div>
                            </div>
                            <button
                              onClick={handleFinalSubmit}
                              disabled={loading}
                              className="w-full h-14 bg-[#2563FF] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all uppercase tracking-widest disabled:opacity-50"
                            >
                              {loading ? "Confirmando..." : "CONFIRMAR TURNO"}
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Mobile: clinic info at bottom */}
            <div className="lg:hidden mt-4">
              <BookingSummary />
            </div>
          </div>

          {/* Sidebar (desktop only) */}
          <div className="hidden lg:block lg:col-span-4 overflow-y-auto no-scrollbar">
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  )
}