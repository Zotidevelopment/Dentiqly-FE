import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, UserPlus, Search, X, Check } from 'lucide-react'
import { PatientForm } from '../booking/PatientForm'
import { turnosApi, profesionalesApi, pacientesApi, serviciosApi } from '../../api'
import type { Profesional, Paciente, Servicio } from '../../types'
import { useToast } from "../../hooks/use-toast"
import { configuracionApi } from '../../api/configuracion'

interface AdminAppointmentModalProps {
    onClose: () => void
    onCreate: () => void
    initialData?: Partial<{
        fecha: string
        hora_inicio: string
        hora_fin: string
        profesional_id: number
        sobre_turno: boolean
        paciente_id: string
        paciente_nombre: string
    }>
}

export const AdminAppointmentModal: React.FC<AdminAppointmentModalProps> = ({ onClose, onCreate, initialData }) => {
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        paciente_id: initialData?.paciente_id || '',
        profesional_id: initialData?.profesional_id || 0,
        servicio_id: 0,
        fecha: initialData?.fecha || new Date().toISOString().split('T')[0],
        hora_inicio: initialData?.hora_inicio || '10:00',
        hora_fin: initialData?.hora_fin || '10:30',
        estado: 'Confirmado',
        observaciones: '',
        sobre_turno: initialData?.sobre_turno || false
    })

    const [loading, setLoading] = useState(false)
    const [profesionales, setProfesionales] = useState<Profesional[]>([])
    const [pacientes, setPacientes] = useState<Paciente[]>([])
    const [servicios, setServicios] = useState<Servicio[]>([])
    const [searchPaciente, setSearchPaciente] = useState(initialData?.paciente_nombre || '')
    const [isNewPatient, setIsNewPatient] = useState(false)
    const [horaFinManual, setHoraFinManual] = useState(false)
    const [conflictingTurnos, setConflictingTurnos] = useState<any[]>([])

    // Recurrence states
    const [semanalesHabilitado, setSemanalesHabilitado] = useState(false)
    const [isRecurrent, setIsRecurrent] = useState(false)
    const [recurrentWeeks, setRecurrentWeeks] = useState(4)
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])

    const WEEKDAYS = [
        { label: 'Lun', value: 1 },
        { label: 'Mar', value: 2 },
        { label: 'Mié', value: 3 },
        { label: 'Jue', value: 4 },
        { label: 'Vie', value: 5 },
        { label: 'Sáb', value: 6 },
        { label: 'Dom', value: 0 }
    ]

    const selectedService = servicios.find(s => s.id === formData.servicio_id)
    const isRecurrentAllowed = semanalesHabilitado || selectedService?.permite_turnos_semanales

    useEffect(() => {
        if (isRecurrent && selectedWeekdays.length === 0 && formData.fecha) {
            const dayOfWeek = new Date(formData.fecha + "T12:00:00").getDay()
            setSelectedWeekdays([dayOfWeek])
        }
    }, [isRecurrent, formData.fecha])

    const generateRecurrentDates = (startDateStr: string, weekdays: number[], weeks: number): string[] => {
        const dates: string[] = []
        if (weekdays.length === 0 || weeks <= 0) return [startDateStr]
        const start = new Date(startDateStr + "T12:00:00")
        for (let i = 0; i < weeks * 7; i++) {
            const current = new Date(start)
            current.setDate(start.getDate() + i)
            const dayOfWeek = current.getDay()
            if (weekdays.includes(dayOfWeek)) {
                dates.push(current.toISOString().split('T')[0])
            }
        }
        return dates
    }

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [profesionalesRes, pacientesRes, serviciosRes, settingsRes] = await Promise.all([
                    profesionalesApi.listar({ limit: 100, estado: 'Activo' }),
                    pacientesApi.listar({ limit: 50 }),
                    serviciosApi.listar({ limit: 100 }),
                    configuracionApi.listar()
                ])
                setProfesionales(profesionalesRes.data || [])
                setPacientes(pacientesRes.data || [])
                setServicios(serviciosRes.data || [])
                const settingSemanales = settingsRes.find(s => s.clave === 'agenda_turnos_semanales_habilitado')
                if (settingSemanales) {
                    setSemanalesHabilitado(settingSemanales.valor === true || settingSemanales.valor === 'true')
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchInitialData()
    }, [])

    useEffect(() => {
        const fetchPacientes = async () => {
            if (searchPaciente.length > 2) {
                try {
                    const response = await pacientesApi.listar({ search: searchPaciente, limit: 10 });
                    setPacientes(response.data || [])
                } catch (error) {
                    console.error('Error fetching patients:', error)
                }
            }
        }
        const delayDebounceFn = setTimeout(() => {
            fetchPacientes()
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [searchPaciente])

    useEffect(() => {
        const checkConflicts = async () => {
            if (!formData.fecha || !formData.hora_inicio || !formData.hora_fin || !formData.profesional_id) {
                setConflictingTurnos([])
                return
            }
            try {
                const res = await turnosApi.listar({ fecha_desde: formData.fecha, fecha_hasta: formData.fecha, limit: 200 })
                const turnos = res.data || []
                const newStart = formData.hora_inicio
                const newEnd = formData.hora_fin
                const conflicts = turnos.filter((t: any) => {
                    if (t.profesional_id !== formData.profesional_id) return false
                    if (t.estado === 'Cancelado' || t.estado === 'Ausente') return false
                    return t.hora_inicio < newEnd && t.hora_fin > newStart
                })
                setConflictingTurnos(conflicts)
                if (conflicts.length > 0 && !formData.sobre_turno) {
                    setFormData(prev => ({ ...prev, sobre_turno: false }))
                }
            } catch {
                setConflictingTurnos([])
            }
        }
        const timer = setTimeout(checkConflicts, 300)
        return () => clearTimeout(timer)
    }, [formData.fecha, formData.hora_inicio, formData.hora_fin, formData.profesional_id])

    // Auto-suggest end time based on service duration ONLY if not manually edited
    useEffect(() => {
        if (horaFinManual) return // Don't override manual selection
        if (formData.servicio_id && formData.hora_inicio) {
            const servicio = servicios.find(s => s.id === formData.servicio_id)
            if (servicio) {
                const duration = servicio.duracion_estimada || 30
                const [hours, minutes] = formData.hora_inicio.split(':').map(Number)
                const totalMinutes = hours * 60 + minutes + duration
                const endHours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
                const endMinutes = String(totalMinutes % 60).padStart(2, '0')
                setFormData(prev => ({ ...prev, hora_fin: `${endHours}:${endMinutes}` }))
            }
        }
    }, [formData.servicio_id, formData.hora_inicio, servicios, horaFinManual])

    const handleNewPatientSubmit = async (data: any) => {
        if (!formData.profesional_id || !formData.servicio_id) {
            toast({ variant: "destructive", title: "Validación", description: "Por favor seleccione profesional y servicio antes de confirmar." })
            return
        }
        setLoading(true)
        try {
            const newPatient = await pacientesApi.crear(data)
            if (isRecurrent) {
                const dates = generateRecurrentDates(formData.fecha, selectedWeekdays, recurrentWeeks)
                await turnosApi.crearBulk({
                    paciente_id: newPatient.id,
                    profesional_id: formData.profesional_id,
                    servicio_id: formData.servicio_id,
                    fechas: dates,
                    hora_inicio: formData.hora_inicio,
                    hora_fin: formData.hora_fin,
                    estado: formData.estado,
                    observaciones: formData.observaciones,
                    sobre_turno: formData.sobre_turno
                })
                toast({ title: "Éxito", description: `Paciente creado y ${dates.length} turnos semanales programados.` })
            } else {
                await turnosApi.crear({
                    paciente_id: newPatient.id,
                    profesional_id: formData.profesional_id,
                    servicio_id: formData.servicio_id,
                    fecha: formData.fecha,
                    hora_inicio: formData.hora_inicio,
                    hora_fin: formData.hora_fin,
                    estado: formData.estado,
                    observaciones: formData.observaciones,
                    sobre_turno: formData.sobre_turno
                })
                toast({ title: "Éxito", description: "Paciente creado y turno programado." })
            }
            onCreate()
            onClose()
        } catch (error: any) {
            console.error('Error creating patient and appointment:', error)
            toast({ variant: "destructive", title: "Error", description: "Error al crear el paciente o el turno." })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isNewPatient) return
        setLoading(true)
        if (!formData.paciente_id || !formData.profesional_id || !formData.servicio_id) {
            toast({ variant: "destructive", title: "Validación", description: "Por favor complete todos los campos requeridos." })
            setLoading(false)
            return
        }
        try {
            if (isRecurrent) {
                const dates = generateRecurrentDates(formData.fecha, selectedWeekdays, recurrentWeeks)
                if (dates.length === 0) {
                    toast({ variant: "destructive", title: "Validación", description: "Seleccione al menos un día para la recurrencia." })
                    setLoading(false)
                    return
                }
                await turnosApi.crearBulk({
                    paciente_id: formData.paciente_id,
                    profesional_id: formData.profesional_id,
                    servicio_id: formData.servicio_id,
                    fechas: dates,
                    hora_inicio: formData.hora_inicio,
                    hora_fin: formData.hora_fin,
                    estado: formData.estado,
                    observaciones: formData.observaciones,
                    sobre_turno: formData.sobre_turno
                })
                toast({ title: "Éxito", description: `${dates.length} turnos semanales programados.` })
            } else {
                await turnosApi.crear({
                    paciente_id: formData.paciente_id,
                    profesional_id: formData.profesional_id,
                    servicio_id: formData.servicio_id,
                    fecha: formData.fecha,
                    hora_inicio: formData.hora_inicio,
                    hora_fin: formData.hora_fin,
                    estado: formData.estado,
                    observaciones: formData.observaciones,
                    sobre_turno: formData.sobre_turno
                })
                toast({ title: "Éxito", description: "Turno programado exitosamente." })
            }
            onCreate()
            onClose()
        } catch (error: any) {
            console.error('Error creating appointment:', error)
            const errorMessage = error.response?.data?.error || 'Error al crear el/los turnos. Verifique solapamientos o habilitar Sobre Turno.'
            toast({ variant: "destructive", title: "Error", description: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    return createPortal(
        <div className="fixed inset-0 bg-[#0A0F2D]/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-500">
            <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-300">

                {/* Header Estilizado */}
                <div className="px-5 py-5 sm:px-8 sm:pt-8 sm:pb-6 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2563FF] shadow-sm">
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                                {formData.sobre_turno ? "Nuevo Sobreturno" : "Agendar Turno"}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">Completa los datos del agendamiento</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Sección: Paciente */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#2563FF]">Información del Paciente</label>
                                <button
                                    type="button"
                                    onClick={() => setIsNewPatient(!isNewPatient)}
                                    className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#2563FF] transition-colors flex items-center gap-1.5"
                                >
                                    {isNewPatient ? (
                                        <><Search size={14} strokeWidth={3} /> Usar Existente</>
                                    ) : (
                                        <><UserPlus size={14} strokeWidth={3} /> Nuevo Paciente</>
                                    )}
                                </button>
                            </div>

                            {isNewPatient ? (
                                <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-3 text-amber-700 mb-4">
                                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                            <UserPlus size={16} />
                                        </div>
                                        <span className="text-sm font-bold">Registro de paciente nuevo activo</span>
                                    </div>
                                    <PatientForm
                                        onPatientData={handleNewPatientSubmit}
                                        loading={loading}
                                        embedded
                                    />
                                </div>
                            ) : (
                                <div className="relative group">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Buscar por DNI, nombre o apellido..."
                                            value={searchPaciente}
                                            onChange={(e) => {
                                                setSearchPaciente(e.target.value);
                                                setFormData({ ...formData, paciente_id: '' });
                                            }}
                                            className="h-14 px-6 bg-gray-50/50 border-gray-100 rounded-2xl font-bold text-lg focus:bg-white transition-all shadow-none group-hover:border-blue-200"
                                            required={!isNewPatient}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {formData.paciente_id ? (
                                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in">
                                                    <Check className="w-4 h-4 text-white" strokeWidth={4} />
                                                </div>
                                            ) : (
                                                <Search className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>
                                    </div>

                                    {searchPaciente.length > 2 && !formData.paciente_id && (
                                        <div className="absolute z-[60] w-full mt-2 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                                            {pacientes.length > 0 ? pacientes.map((paciente) => (
                                                <div
                                                    key={paciente.id}
                                                    className="px-6 py-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none transition-all flex items-center justify-between group/item"
                                                    onClick={() => {
                                                        setFormData({ ...formData, paciente_id: paciente.id });
                                                        setSearchPaciente(`${paciente.apellido}, ${paciente.nombre} (DNI: ${paciente.numero_documento})`);
                                                    }}
                                                >
                                                    <div>
                                                        <div className="font-black text-gray-900">{paciente.apellido}, {paciente.nombre}</div>
                                                        <div className="text-xs text-gray-400 font-bold">DNI: {paciente.numero_documento}</div>
                                                    </div>
                                                    <div className="opacity-0 group-hover/item:opacity-100 text-[#2563FF] font-black text-[10px] uppercase tracking-widest">
                                                        Seleccionar
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-8 text-center text-gray-400 font-bold">No se encontraron pacientes</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sección: Detalles Médicos */}
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {isNewPatient && (
                                <label className="text-[11px] font-black uppercase tracking-widest text-[#2563FF] px-1">Detalles del Turno</label>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Profesional *</label>
                                    <select
                                        value={formData.profesional_id || ''}
                                        onChange={(e) => setFormData({ ...formData, profesional_id: parseInt(e.target.value) })}
                                        className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563FF] outline-none transition-all appearance-none"
                                        required
                                    >
                                        <option value="">Seleccionar profesional</option>
                                        {profesionales.map((prof) => (
                                            <option key={prof.id} value={prof.id}>
                                                {prof.apellido}, {prof.nombre} - {prof.especialidad}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Servicio *</label>
                                    <select
                                        value={formData.servicio_id || ''}
                                        onChange={(e) => setFormData({ ...formData, servicio_id: parseInt(e.target.value) })}
                                        className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-[#2563FF] outline-none transition-all appearance-none"
                                        required
                                    >
                                        <option value="">Seleccionar servicio</option>
                                        {servicios.map((serv) => (
                                            <option key={serv.id} value={serv.id}>
                                                {serv.nombre} ({serv.duracion_estimada} min)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 bg-blue-50/30 rounded-2xl sm:rounded-[2rem] border border-blue-100/50 space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#2563FF] px-1">Fecha</label>
                                        <Input
                                            type="date"
                                            value={formData.fecha}
                                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                            required
                                            className="h-11 bg-white border-blue-100 rounded-xl font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#2563FF] px-1">Hora Inicio</label>
                                        <Input
                                            type="time"
                                            value={formData.hora_inicio}
                                            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                                            required
                                            className="h-11 bg-white border-blue-100 rounded-xl font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-[#2563FF] px-1">Hora Fin</label>
                                        <Input
                                            type="time"
                                            value={formData.hora_fin}
                                            onChange={(e) => {
                                                setHoraFinManual(true)
                                                setFormData({ ...formData, hora_fin: e.target.value })
                                            }}
                                            required
                                            className="h-11 bg-white border-blue-100 rounded-xl font-bold"
                                        />
                                    </div>
                                </div>

                                {conflictingTurnos.length > 0 && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <span className="text-white text-[10px] font-black">!</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-amber-900">Este horario coincide con {conflictingTurnos.length} turno{conflictingTurnos.length > 1 ? 's' : ''}</p>
                                                <div className="mt-1.5 space-y-1">
                                                    {conflictingTurnos.slice(0, 3).map((t: any) => (
                                                        <p key={t.id} className="text-[11px] text-amber-800 font-medium">
                                                            {t.hora_inicio.substring(0, 5)} - {t.hora_fin.substring(0, 5)} &bull; {t.paciente?.nombre} {t.paciente?.apellido}
                                                        </p>
                                                    ))}
                                                </div>
                                                <p className="text-[11px] text-amber-700 font-semibold mt-2">¿Deseas agendar un sobreturno?</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, sobre_turno: true }))}
                                                className={`flex-1 py-2 text-[12px] font-bold rounded-xl transition-all ${formData.sobre_turno ? 'bg-amber-500 text-white' : 'bg-white border border-amber-200 text-amber-700 hover:bg-amber-100'}`}>
                                                Sí, agendar sobreturno
                                            </button>
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, sobre_turno: false }))}
                                                className={`flex-1 py-2 text-[12px] font-bold rounded-xl transition-all ${!formData.sobre_turno ? 'bg-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                No, cambiar horario
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {conflictingTurnos.length === 0 && (
                                    <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl group cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, sobre_turno: !prev.sobre_turno }))}>
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.sobre_turno ? 'bg-red-500 border-red-500 text-white' : 'border-gray-200 bg-white'}`}>
                                            {formData.sobre_turno && <Check size={14} strokeWidth={4} />}
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-sm font-black text-gray-900">Forzar agendamiento (Sobre Turno)</span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Ignora restricciones de horario y solapamientos</p>
                                        </div>
                                    </div>
                                )}

                                {/* Opciones de agendado semanal recurrentes */}
                                {isRecurrentAllowed && (
                                    <div className="space-y-4 pt-4 border-t border-blue-100/50">
                                        <div
                                            className="flex items-center gap-3 p-3 bg-white/60 rounded-xl cursor-pointer hover:bg-white transition-all"
                                            onClick={() => setIsRecurrent(!isRecurrent)}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isRecurrent ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 bg-white'}`}>
                                                {isRecurrent && <Check size={12} strokeWidth={4} />}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-gray-800">Repetir turno semanalmente (Recurrente)</span>
                                            </div>
                                        </div>

                                        {isRecurrent && (
                                            <div className="p-4 bg-white rounded-xl border border-blue-100/80 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Días de repetición</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {WEEKDAYS.map((day) => {
                                                            const isSelected = selectedWeekdays.includes(day.value)
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={day.value}
                                                                    onClick={() => {
                                                                        if (isSelected) {
                                                                            setSelectedWeekdays(selectedWeekdays.filter(v => v !== day.value))
                                                                        } else {
                                                                            setSelectedWeekdays([...selectedWeekdays, day.value])
                                                                        }
                                                                    }}
                                                                    className={`h-9 px-3 rounded-lg text-xs font-bold transition-all ${isSelected
                                                                            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                                                                            : 'bg-gray-50 text-gray-650 hover:bg-gray-150 hover:text-gray-900'
                                                                        }`}
                                                                >
                                                                    {day.label}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Cantidad de semanas</label>
                                                        <span className="text-xs text-gray-400">Duración del ciclo recurrente</span>
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={24}
                                                        value={recurrentWeeks}
                                                        onChange={(e) => setRecurrentWeeks(e.target.value ? Number(e.target.value) : 4)}
                                                        className="w-20 text-center font-bold h-10 rounded-lg bg-gray-50 border-gray-150 focus:bg-white"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Estado del Turno</label>
                                    <select
                                        value={formData.estado}
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="w-full h-12 px-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white transition-all appearance-none"
                                    >
                                        <option value="Confirmado">Confirmado</option>
                                        <option value="Creado">Creado</option>
                                        <option value="En sala de espera">En sala de espera</option>
                                        <option value="Atendido">Atendido</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 px-1">Observaciones</label>
                                    <textarea
                                        value={formData.observaciones}
                                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                        className="w-full h-24 px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white transition-all resize-none outline-none"
                                        placeholder="Notas internas..."
                                    />
                                </div>
                            </div>

                            {!isNewPatient && (
                                <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4 sticky bottom-0 bg-white border-t border-gray-100 py-3 sm:py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-[12px] uppercase tracking-widest border-2"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#2563FF] hover:bg-blue-700 text-white font-black text-[11px] sm:text-[12px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:translate-y-0"
                                    >
                                        {loading ? 'Procesando...' : 'Confirmar'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    )
}
