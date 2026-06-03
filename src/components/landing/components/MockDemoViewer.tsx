import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Bell,
  Sparkles,
  X,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  MessageSquare,
  Building,
  User,
  Heart,
  FileText
} from "lucide-react"

// Types
type TabType = "dashboard" | "calendar" | "patients" | "reminders" | "booking"

interface MockDemoViewerProps {
  initialTab?: TabType
  onClose: () => void
}

// ────────────────────────────────────────────────────────
// 1. DASHBOARD MOCK
// ────────────────────────────────────────────────────────
const MockDashboard: React.FC = () => {
  const stats = [
    { title: "Turnos Agendados", value: "24", change: "+12% hoy", icon: <CalendarIcon className="w-5 h-5 text-[#0047FF]" /> },
    { title: "Ausentismo", value: "3.8%", change: "-2.1% esta semana", icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
    { title: "Historias Clínicas", value: "1,240", change: "+8 nuevas", icon: <Users className="w-5 h-5 text-indigo-500" /> },
  ]

  const activities = [
    { text: "Paciente Carlos Sánchez confirmó asistencia vía email.", time: "Hace 10 min", type: "confirm" },
    { text: "Dr. Martín Pérez actualizó el odontograma de Ana Gómez.", time: "Hace 25 min", type: "edit" },
    { text: "Nuevo turno reservado online - Sede Palermo.", time: "Hace 1 hora", type: "booking" },
    { text: "Recordatorios enviados para los turnos de mañana.", time: "Hace 2 horas", type: "notification" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#0A0F2D]">Dashboard General</h3>
          <p className="text-sm text-gray-500">Estado de tu clínica dental en tiempo real.</p>
        </div>
        <span className="text-xs bg-[#0047FF]/10 text-[#0047FF] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Clínica Demo
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-gray-150 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-400">{stat.title}</span>
              <div className="p-2 bg-gray-50 rounded-xl">{stat.icon}</div>
            </div>
            <div className="text-3xl font-extrabold text-[#0A0F2D] mb-1">{stat.value}</div>
            <span className="text-xs font-semibold text-gray-500">{stat.change}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Analytics Simulation */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-[#0A0F2D] mb-4">Ocupación de la Semana</h4>
          <div className="flex items-end justify-between h-48 pt-4 gap-2">
            {[75, 85, 95, 60, 90, 40, 20].map((height, i) => {
              const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#0047FF]/10 rounded-t-lg relative group h-full flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="w-full bg-[#0047FF] rounded-t-lg group-hover:bg-[#003BCC] transition-colors relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded font-mono transition-opacity z-10">
                        {height}%
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{days[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm">
          <h4 className="font-bold text-[#0A0F2D] mb-4">Actividad Reciente</h4>
          <div className="space-y-4">
            {activities.map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#0047FF] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[#0A0F2D] font-medium leading-snug">{act.text}</p>
                  <span className="text-[11px] text-gray-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// 2. CALENDAR MOCK
// ────────────────────────────────────────────────────────
interface Appointment {
  id: string
  time: string
  patient: string
  treatment: string
  status: "pending" | "confirmed" | "cancelled"
}

const MockCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "1", time: "09:00", patient: "Carlos Sánchez", treatment: "Limpieza Dental", status: "confirmed" },
    { id: "2", time: "10:30", patient: "Ana Gómez", treatment: "Ortodoncia Control", status: "pending" },
    { id: "3", time: "12:00", patient: "Mariana Rojas", treatment: "Implante Consulta", status: "confirmed" },
    { id: "4", time: "15:00", patient: "Roberto Díaz", treatment: "Extracción", status: "cancelled" },
  ])

  const [newPatient, setNewPatient] = useState("")
  const [newTreatment, setNewTreatment] = useState("Limpieza")
  const [newTime, setNewTime] = useState("16:30")
  const [showAddForm, setShowAddForm] = useState(false)

  const toggleStatus = (id: string) => {
    setAppointments(
      appointments.map((app) => {
        if (app.id === id) {
          const nextStatus: Record<string, "pending" | "confirmed" | "cancelled"> = {
            pending: "confirmed",
            confirmed: "cancelled",
            cancelled: "pending",
          }
          return { ...app, status: nextStatus[app.status] }
        }
        return app
      })
    )
  }

  const addAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatient.trim()) return
    const newApp: Appointment = {
      id: Date.now().toString(),
      time: newTime,
      patient: newPatient,
      treatment: newTreatment,
      status: "pending",
    }
    setAppointments([...appointments, newApp].sort((a, b) => a.time.localeCompare(b.time)))
    setNewPatient("")
    setShowAddForm(false)
  }

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter((app) => app.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#0A0F2D]">Agenda Diaria</h3>
          <p className="text-sm text-gray-500">Hace clic en un turno para cambiar su estado (Confirmar / Cancelar).</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#0047FF] text-white hover:bg-[#003BCC] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#0047FF]/10 shrink-0"
        >
          <Plus size={14} /> Nuevo Turno
        </button>
      </div>

      {showAddForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-150 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          onSubmit={addAppointment}
        >
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Paciente</label>
            <input
              type="text"
              placeholder="Nombre del paciente"
              value={newPatient}
              onChange={(e) => setNewPatient(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#0A0F2D] focus:outline-[#0047FF]"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Tratamiento</label>
            <select
              value={newTreatment}
              onChange={(e) => setNewTreatment(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#0A0F2D] focus:outline-[#0047FF]"
            >
              <option value="Limpieza">Limpieza Dental</option>
              <option value="Ortodoncia">Ortodoncia Control</option>
              <option value="Implante">Consulta Implante</option>
              <option value="Extracción">Extracción</option>
              <option value="Conducto">Tratamiento de Conducto</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Hora</label>
            <select
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#0A0F2D] focus:outline-[#0047FF]"
            >
              {["08:00", "08:30", "09:30", "11:00", "13:30", "14:30", "16:00", "16:30", "17:00"].map((t) => (
                <option key={t} value={t}>{t} hs</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-[#0047FF] text-white hover:bg-[#003BCC] py-2 rounded-lg text-xs font-bold transition-all"
          >
            Agregar Turno
          </button>
        </motion.form>
      )}

      {/* Calendar List */}
      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b border-gray-150 px-5 py-3 grid grid-cols-12 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-2">Hora</div>
          <div className="col-span-4">Paciente</div>
          <div className="col-span-4">Tratamiento</div>
          <div className="col-span-2 text-right">Estado</div>
        </div>

        <div className="divide-y divide-gray-100">
          {appointments.map((app) => {
            const statusStyles = {
              pending: "bg-amber-100 text-amber-700 border-amber-200",
              confirmed: "bg-green-100 text-green-700 border-green-200",
              cancelled: "bg-red-100 text-red-700 border-red-200",
            }

            const statusLabels = {
              pending: "Pendiente",
              confirmed: "Confirmado",
              cancelled: "Cancelado",
            }

            return (
              <div
                key={app.id}
                className="px-5 py-3.5 grid grid-cols-12 items-center hover:bg-gray-50 transition-colors text-xs text-[#0A0F2D]"
              >
                <div className="col-span-2 font-mono font-bold text-gray-400">{app.time}</div>
                <div className="col-span-4 font-semibold text-[#0A0F2D]">{app.patient}</div>
                <div className="col-span-4 text-gray-500">{app.treatment}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => toggleStatus(app.id)}
                    className={`px-3 py-1 rounded-full font-bold text-[10px] border transition-all cursor-pointer ${statusStyles[app.status]}`}
                  >
                    {statusLabels[app.status]}
                  </button>
                  <button
                    onClick={() => deleteAppointment(app.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// 3. PATIENT DETAIL / ODONTOGRAM MOCK
// ────────────────────────────────────────────────────────
interface Tooth {
  id: number
  status: "sano" | "caries" | "tratado" | "corona"
}

const MockPatientDetail: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"odontograma" | "historia">("odontograma")
  const [history, setHistory] = useState([
    { date: "03/06/2026", user: "Dr. Pérez", action: "Revisión general realizada." },
    { date: "15/05/2026", user: "Dra. Gómez", action: "Tratamiento de caries en diente 16 finalizado." },
    { date: "02/05/2026", user: "Dr. Pérez", action: "Se colocó corona provisoria en diente 11." },
  ])

  // Simple set of 8 teeth
  const [teeth, setTeeth] = useState<Tooth[]>([
    { id: 18, status: "sano" },
    { id: 17, status: "sano" },
    { id: 16, status: "caries" },
    { id: 15, status: "sano" },
    { id: 14, status: "tratado" },
    { id: 13, status: "sano" },
    { id: 12, status: "sano" },
    { id: 11, status: "corona" },
  ])

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null)

  const updateToothStatus = (toothId: number, status: "sano" | "caries" | "tratado" | "corona") => {
    setTeeth(
      teeth.map((t) => {
        if (t.id === toothId) {
          return { ...t, status }
        }
        return t
      })
    )

    const statusLabels = {
      sano: "Marcado como Sano",
      caries: "Caries registrada",
      tratado: "Tratamiento finalizado",
      corona: "Corona colocada",
    }

    // Add activity history
    const newHistory = {
      date: new Date().toLocaleDateString("es-AR"),
      user: "Dr. Pérez",
      action: `${statusLabels[status]} en pieza dental ${toothId}.`,
    }
    setHistory([newHistory, ...history])
    setSelectedTooth(null)
  }

  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-150 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#0A0F2D]">Mariano Rodríguez</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
              ID #8749
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">34 años · O. Social: Swiss Medical · Tel: 11-3829-4820</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("odontograma")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "odontograma"
                ? "bg-[#0047FF] text-white"
                : "bg-white border border-gray-200 text-[#0A0F2D] hover:bg-gray-50"
            }`}
          >
            Odontograma
          </button>
          <button
            onClick={() => setActiveTab("historia")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "historia"
                ? "bg-[#0047FF] text-white"
                : "bg-white border border-gray-200 text-[#0A0F2D] hover:bg-gray-50"
            }`}
          >
            Historia Clínica
          </button>
        </div>
      </div>

      {activeTab === "odontograma" ? (
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="text-center">
            <h4 className="font-bold text-[#0A0F2D] text-sm">Odontograma Digital Interactivo</h4>
            <p className="text-xs text-gray-400 mt-0.5">Hace clic en cualquier diente para registrar hallazgos o tratamientos.</p>
          </div>

          {/* Simple Row of Teeth */}
          <div className="flex flex-wrap justify-center items-center gap-4 py-6">
            {teeth.map((t) => {
              const colors = {
                sano: "border-gray-200 bg-white hover:bg-gray-50 text-gray-700",
                caries: "border-red-300 bg-red-50 hover:bg-red-100 text-red-600 shadow-[0_0_10px_rgba(239,68,68,0.15)]",
                tratado: "border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 shadow-[0_0_10px_rgba(37,99,255,0.15)]",
                corona: "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
              }

              return (
                <div key={t.id} className="relative">
                  <button
                    onClick={() => setSelectedTooth(t.id === selectedTooth ? null : t.id)}
                    className={`w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-between p-2 cursor-pointer transition-all duration-200 ${colors[t.status]}`}
                  >
                    <span className="text-[10px] font-bold text-gray-400">{t.id}</span>
                    <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center relative overflow-hidden">
                      <Heart size={14} className={`${t.status === 'sano' ? 'text-gray-300' : 'text-current'}`} />
                    </div>
                    <span className="text-[9px] font-bold capitalize">{t.status}</span>
                  </button>

                  {selectedTooth === t.id && (
                    <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 w-40 z-20 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center border-b border-gray-100 pb-1 mb-1">
                        Diente {t.id}
                      </p>
                      <button
                        onClick={() => updateToothStatus(t.id, "sano")}
                        className="w-full text-left text-xs px-2.5 py-1 rounded hover:bg-gray-100 font-semibold text-gray-700"
                      >
                        🦷 Marcar Sano
                      </button>
                      <button
                        onClick={() => updateToothStatus(t.id, "caries")}
                        className="w-full text-left text-xs px-2.5 py-1 rounded hover:bg-red-50 font-semibold text-red-600"
                      >
                        🔴 Caries
                      </button>
                      <button
                        onClick={() => updateToothStatus(t.id, "tratado")}
                        className="w-full text-left text-xs px-2.5 py-1 rounded hover:bg-blue-50 font-semibold text-blue-600"
                      >
                        🔵 Tratado
                      </button>
                      <button
                        onClick={() => updateToothStatus(t.id, "corona")}
                        className="w-full text-left text-xs px-2.5 py-1 rounded hover:bg-amber-50 font-semibold text-amber-600"
                      >
                        🟡 Corona
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-bold text-gray-400 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-white border border-gray-200" /> Sano</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-500" /> Caries</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500" /> Tratado</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-500" /> Corona</div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-bold text-[#0A0F2D] text-sm">Historial Clínico Digital</h4>
          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
            {history.map((hist, i) => (
              <div key={i} className="flex gap-4 relative pl-8">
                <div className="absolute left-[8px] top-1.5 w-[10px] h-[10px] rounded-full border-2 border-white bg-[#0047FF] ring-4 ring-[#0047FF]/10 z-10" />
                <div className="flex-1 bg-gray-50 border border-gray-150 p-3.5 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#0047FF] uppercase tracking-wider">{hist.user}</span>
                    <span className="text-[10px] font-mono text-gray-400">{hist.date}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0A0F2D] leading-snug">{hist.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────
// 4. REMINDERS MOCK
// ────────────────────────────────────────────────────────
const MockReminders: React.FC = () => {
  const [patientName, setPatientName] = useState("Carlos Sánchez")
  const [date, setDate] = useState("04 de Junio a las 10:30")
  const [doctor, setDoctor] = useState("Dra. Laura Gómez")

  const getTemplatePreview = () => {
    return `Hola ${patientName || "[Paciente]"}, te recordamos tu próximo turno el ${date || "[Fecha]"} con ${doctor || "[Profesional]"}. Si deseas confirmar, responde SI. Para cancelar, responde NO.`
  }

  const list = [
    { patient: "Carlos Sánchez", time: "09:12 hs", channel: "WhatsApp", status: "confirmado" },
    { patient: "Ana Gómez", time: "10:30 hs", channel: "Email", status: "pendiente" },
    { patient: "Mariana Rojas", time: "11:05 hs", channel: "WhatsApp", status: "confirmado" },
    { patient: "Roberto Díaz", time: "11:45 hs", channel: "Email", status: "cancelado" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#0A0F2D]">Recordatorios Automáticos</h3>
          <p className="text-sm text-gray-500">Reduce ausentismos enviando alertas de confirmación automáticas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor & Live Preview */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-bold text-[#0A0F2D] text-sm">Personalizar Mensaje</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nombre Paciente (Simulación)</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#0A0F2D] focus:outline-[#0047FF]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Profesional (Simulación)</label>
              <input
                type="text"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-[#0A0F2D] focus:outline-[#0047FF]"
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4.5 space-y-2 mt-4 relative">
            <span className="absolute top-2 right-3 text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Vista Previa
            </span>
            <div className="text-xs font-mono text-[#0A0F2D] leading-relaxed whitespace-pre-line pt-2">
              {getTemplatePreview()}
            </div>
          </div>
        </div>

        {/* Reminders List logs */}
        <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-bold text-[#0A0F2D] text-sm">Registro de Mensajes de Hoy</h4>

          <div className="divide-y divide-gray-100">
            {list.map((item, idx) => {
              const statusColors = {
                confirmado: "bg-green-100 text-green-700 border-green-200",
                pendiente: "bg-amber-100 text-amber-700 border-amber-200",
                cancelado: "bg-red-100 text-red-700 border-red-200",
              }
              return (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#0A0F2D]">{item.patient}</p>
                    <span className="text-[10px] text-gray-400 font-medium">{item.time} · Vía {item.channel}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] border capitalize ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// 5. BOOKING MOCK WIZARD
// ────────────────────────────────────────────────────────
const MockBooking: React.FC = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    branch: "",
    doctor: "",
    time: "",
    name: "",
    email: "",
  })

  const branches = ["Sede Palermo (Av. Santa Fe 2300)", "Sede Belgrano (Av. Cabildo 1800)"]
  const doctors = ["Dra. Laura Gómez (Odontología General)", "Dr. Martín Pérez (Ortodoncia / Implantes)"]
  const slots = ["09:00 hs", "10:30 hs", "14:00 hs", "16:30 hs"]

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleSelect = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    nextStep()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    nextStep()
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto py-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#0A0F2D]">Portal de Reservas Online</h3>
        <p className="text-xs text-gray-500 mt-1">Este es el flujo interactivo que verán tus pacientes desde tu web.</p>
      </div>

      <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-md min-h-[260px] flex flex-col justify-between">
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? "w-8 bg-[#0047FF]" : "w-2 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step Contents */}
        <div className="flex-1 flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider text-center mb-3">1. Seleccionar Sucursal</h4>
              <div className="flex flex-col gap-2">
                {branches.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleSelect("branch", b)}
                    className="w-full bg-gray-50 border border-gray-200 hover:border-[#0047FF] hover:bg-blue-50/20 text-left px-5 py-3 rounded-xl text-xs font-semibold text-[#0A0F2D] transition-all cursor-pointer"
                  >
                    🏢 {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider text-center mb-3">2. Seleccionar Profesional</h4>
              <div className="flex flex-col gap-2">
                {doctors.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleSelect("doctor", d)}
                    className="w-full bg-gray-50 border border-gray-200 hover:border-[#0047FF] hover:bg-blue-50/20 text-left px-5 py-3 rounded-xl text-xs font-semibold text-[#0A0F2D] transition-all cursor-pointer"
                  >
                    👩‍⚕️ {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider text-center mb-3">3. Seleccionar Turno</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {slots.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleSelect("time", t)}
                    className="bg-gray-50 border border-gray-200 hover:border-[#0047FF] hover:bg-blue-50/20 px-4 py-3.5 rounded-xl text-xs font-mono font-bold text-center text-[#0A0F2D] transition-all cursor-pointer"
                  >
                    ⏰ {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider text-center mb-3">4. Tus Datos</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre y Apellido"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#0A0F2D] focus:outline-[#0047FF]"
                />
                <input
                  type="email"
                  placeholder="Email de contacto"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-[#0A0F2D] focus:outline-[#0047FF]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0047FF] text-white hover:bg-[#003BCC] py-3 rounded-xl text-xs font-bold transition-all mt-4"
              >
                Confirmar Reserva
              </button>
            </form>
          )}

          {step === 5 && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in duration-300">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md">
                <Check size={28} className="stroke-[3]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">¡Turno Reservado con éxito!</h4>
                <p className="text-xs text-gray-500 mt-1">El paciente recibirá una confirmación automática por correo electrónico.</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-150 p-4 rounded-2xl text-left text-xs max-w-xs mx-auto space-y-1">
                <p className="text-gray-400 uppercase tracking-wider font-extrabold text-[9px] mb-1">Resumen del Turno</p>
                <p><span className="font-semibold">Sede:</span> {formData.branch.split(" (")[0]}</p>
                <p><span className="font-semibold">Odontólogo:</span> {formData.doctor.split(" (")[0]}</p>
                <p><span className="font-semibold">Turno:</span> {formData.time} hs</p>
                <p><span className="font-semibold">Paciente:</span> {formData.name}</p>
              </div>

              <button
                onClick={() => {
                  setFormData({ branch: "", doctor: "", time: "", name: "", email: "" })
                  setStep(1)
                }}
                className="text-xs text-[#0047FF] hover:underline font-bold"
              >
                Reservar otro turno
              </button>
            </div>
          )}
        </div>

        {/* Back navigation */}
        {step > 1 && step < 5 && (
          <button
            onClick={prevStep}
            className="text-[10px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-wider mt-4"
          >
            ← Volver
          </button>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────
// MAIN WRAPPER
// ────────────────────────────────────────────────────────
export const MockDemoViewer: React.FC<MockDemoViewerProps> = ({ initialTab = "dashboard", onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "calendar", label: "Calendario", icon: <CalendarIcon size={16} /> },
    { id: "patients", label: "Ficha Paciente", icon: <FileText size={16} /> },
    { id: "reminders", label: "Recordatorios", icon: <Bell size={16} /> },
    { id: "booking", label: "Booking", icon: <Clock size={16} /> },
  ] as const

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden border border-gray-200"
      >
        {/* Header Bar */}
        <div className="bg-[#0A0F2D] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0047FF] animate-pulse" />
            <span className="text-sm font-bold tracking-tight">Playground Interactivo - Dentiqly Admin</span>
            <span className="text-[10px] bg-white/10 text-white/80 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
              Modo Demo
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* App Frame Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-48 bg-[#FAFCFF] border-r border-gray-200 p-4 hidden md:flex flex-col gap-1">
            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest px-2 mb-3">Administración</p>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-[#0047FF] text-white shadow-md shadow-[#0047FF]/10"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/55"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              )
            })}
            <div className="mt-auto bg-gray-50 border border-gray-150 p-3.5 rounded-xl text-[10px] text-gray-400 font-semibold space-y-1">
              <p className="text-[#0047FF] font-bold">💡 Modo Interactiva</p>
              <p>Puedes agregar turnos, editar el odontograma o reservar en vivo.</p>
            </div>
          </div>

          {/* Main App Workspace */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FCFDFF]">
            {/* Mobile Tab Navigation */}
            <div className="md:hidden flex items-center bg-[#FAFCFF] border-b border-gray-200 overflow-x-auto no-scrollbar gap-1 p-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#0047FF] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* View workspace */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === "dashboard" && <MockDashboard />}
                  {activeTab === "calendar" && <MockCalendar />}
                  {activeTab === "patients" && <MockPatientDetail />}
                  {activeTab === "reminders" && <MockReminders />}
                  {activeTab === "booking" && <MockBooking />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
