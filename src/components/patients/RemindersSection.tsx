import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import {
  Bell,
  Send,
  Clock,
  Calendar,
  User,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
} from 'lucide-react'
import { turnosApi, recordatoriosApi } from '../../api'
import type { Turno } from '../../types'

interface RemindersSectionProps {
  pacienteId: string
}

export const RemindersSection: React.FC<RemindersSectionProps> = ({ pacienteId }) => {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<number | null>(null)
  const [sentIds, setSentIds] = useState<Set<number>>(new Set())
  const [errorId, setErrorId] = useState<number | null>(null)

  useEffect(() => {
    fetchTurnos()
  }, [pacienteId])

  const fetchTurnos = async () => {
    try {
      setLoading(true)
      // Fetch upcoming turnos for this patient
      const today = new Date().toISOString().split('T')[0]
      const response = await turnosApi.listar({
        paciente_id: pacienteId,
        fecha_desde: today,
        limit: 50,
      })
      // Filter only Pendiente/Confirmado
      const upcoming = (response.data || []).filter(
        (t: Turno) => ['Pendiente', 'Confirmado', 'Creado', 'Confirmado por email', 'Confirmado por SMS', 'Confirmado por Whatsapp'].includes(t.estado)
      )
      // Sort by date ascending
      upcoming.sort((a: Turno, b: Turno) => {
        const dateCompare = a.fecha.localeCompare(b.fecha)
        if (dateCompare !== 0) return dateCompare
        return a.hora_inicio.localeCompare(b.hora_inicio)
      })
      setTurnos(upcoming)
    } catch (error) {
      console.error('Error fetching turnos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminder = async (turnoId: number) => {
    try {
      setSendingId(turnoId)
      setErrorId(null)
      await recordatoriosApi.enviar(turnoId)
      setSentIds((prev) => new Set(prev).add(turnoId))
    } catch (error) {
      console.error('Error sending reminder:', error)
      setErrorId(turnoId)
    } finally {
      setSendingId(null)
    }
  }

  const formatDate = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Bell className="h-5 w-5 text-[#026498]" />
        <h3 className="text-lg font-semibold text-gray-900">Recordatorios de Turnos</h3>
      </div>

      <p className="text-sm text-gray-500">
        Envía recordatorios por email al paciente sobre sus próximos turnos.
      </p>

      {turnos.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No hay turnos próximos</p>
            <p className="text-sm text-gray-400 mt-1">
              El paciente no tiene turnos pendientes o confirmados a futuro.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {turnos.map((turno) => {
            const isSent = sentIds.has(turno.id)
            const isSending = sendingId === turno.id
            const hasError = errorId === turno.id

            return (
              <Card key={turno.id} className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="capitalize">{formatDate(turno.fecha)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {turno.hora_inicio} - {turno.hora_fin}
                    </div>
                    {turno.profesional && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-4 w-4 text-gray-400" />
                        {turno.profesional.nombre} {turno.profesional.apellido}
                      </div>
                    )}
                    {turno.servicio && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        {turno.servicio.nombre}
                      </div>
                    )}
                    <div className="mt-1">
                      <span
                        className="px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: turno.estado.includes('Confirmado') ? '#dcfce7' : '#fef3c7',
                          color: turno.estado.includes('Confirmado') ? '#166534' : '#92400e',
                        }}
                      >
                        {turno.estado}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isSent ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="h-5 w-5" />
                        Enviado
                      </div>
                    ) : hasError ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          Error al enviar
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendReminder(turno.id)}
                          className="bg-[#026498] w-full sm:w-auto justify-center"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Reintentar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSendReminder(turno.id)}
                        disabled={isSending}
                        className="bg-[#026498] w-full sm:w-auto justify-center"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-1" />
                            Enviar Recordatorio
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
