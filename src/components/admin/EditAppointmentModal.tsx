import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { turnosApi, adminApi, recordatoriosApi } from '../../api'
import type { Turno, Profesional } from '../../types'
import { Mail, X } from 'lucide-react'
import { useToast } from "../../hooks/use-toast"

interface EditAppointmentModalProps {
    appointment: Turno
    onClose: () => void
    onUpdate: () => void
}

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({ appointment, onClose, onUpdate }) => {
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        fecha: appointment.fecha.split('T')[0],
        hora_inicio: appointment.hora_inicio,
        hora_fin: appointment.hora_fin,
        profesional_id: appointment.profesional_id,
        estado: appointment.estado,
        observaciones: appointment.observaciones || ''
    })
    const [loading, setLoading] = useState(false)
    const [profesionales, setProfesionales] = useState<Profesional[]>([])
    const [sendingReminder, setSendingReminder] = useState(false)

    useEffect(() => {
        const fetchProfesionales = async () => {
            try {
                const response = await adminApi.profesionales.listar({ limit: 100 })
                setProfesionales(response.data || [])
            } catch (error) {
                console.error('Error fetching professionals:', error)
            }
        }
        fetchProfesionales()
    }, [])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.hora_fin <= formData.hora_inicio) {
            toast({ variant: "destructive", title: "Validación", description: "La hora de fin debe ser posterior a la hora de inicio" })
            return
        }
        setLoading(true)
        try {
            await turnosApi.actualizar(appointment.id, formData)
            onUpdate()
            onClose()
        } catch (error) {
            console.error('Error updating appointment:', error)
            toast({ variant: "destructive", title: "Error", description: "Error al actualizar el turno" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-[2rem] sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="px-5 py-5 sm:px-8 sm:pt-8 sm:pb-5 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Editar Turno</h3>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Paciente</label>
                            <Input
                                type="text"
                                value={`${appointment.paciente?.apellido || ''}, ${appointment.paciente?.nombre || ''}`}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-500 font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Profesional</label>
                            <select
                                value={formData.profesional_id}
                                onChange={(e) => setFormData({ ...formData, profesional_id: parseInt(e.target.value) })}
                                className="w-full border-gray-200 rounded-xl p-3 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-700"
                                required
                            >
                                <option value="">Seleccionar profesional</option>
                                {profesionales.map((prof) => (
                                    <option key={prof.id} value={prof.id}>
                                        {prof.apellido}, {prof.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Fecha</label>
                            <Input
                                type="date"
                                value={formData.fecha}
                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Hora Inicio</label>
                                <Input
                                    type="time"
                                    value={formData.hora_inicio}
                                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Hora Fin</label>
                                <Input
                                    type="time"
                                    value={formData.hora_fin}
                                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">Estado</label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                className="w-full border-gray-200 rounded-xl p-3 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-700"
                            >
                                <option value="Creado">Creado</option>
                                <option value="Esperando confirmación">Esperando confirmación</option>
                                <option value="Confirmado por email">Confirmado por email</option>
                                <option value="Confirmado por SMS">Confirmado por SMS</option>
                                <option value="Confirmado por Whatsapp">Confirmado por Whatsapp</option>
                                <option value="Confirmado">Confirmado</option>
                                <option value="En sala de espera">En sala de espera</option>
                                <option value="Atendiéndose">Atendiéndose</option>
                                <option value="Atendido">Atendido</option>
                                <option value="Cancelado">Cancelado</option>
                                <option value="Ausente">Ausente</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700">Observaciones</label>
                            <textarea
                                value={formData.observaciones}
                                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                className="w-full border-gray-200 rounded-xl p-3 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium text-gray-700 h-28 resize-none"
                                placeholder="Agregar notas sobre el turno..."
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-100 sticky bottom-0 bg-white py-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                try {
                                    setSendingReminder(true)
                                    await recordatoriosApi.enviar(appointment.id)
                                    toast({ title: "Éxito", description: "Recordatorio enviado correctamente" })
                                } catch (error: any) {
                                    toast({ variant: "destructive", title: "Error", description: error.message || "Error al enviar recordatorio" })
                                } finally {
                                    setSendingReminder(false)
                                }
                            }}
                            disabled={sendingReminder || !appointment.paciente?.email}
                            title={!appointment.paciente?.email ? 'El paciente no tiene email' : ''}
                            className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-bold shadow-sm py-2.5"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            {sendingReminder ? 'Enviando...' : 'Recordatorio'}
                        </Button>
                        <div className="flex gap-2 sm:gap-3">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none rounded-xl font-bold shadow-sm py-2.5">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-[2] sm:flex-none rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm px-6 py-2.5">
                                {loading ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                </form>
                </div>
            </div>
        </div>
    )
}
