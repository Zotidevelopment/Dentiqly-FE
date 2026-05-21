"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Clock, Save, RotateCcw, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { profesionalesApi } from "../../api/profesionales"
import { useToast } from "../../hooks/use-toast"
import type { Profesional, HorariosSemanales, HorarioDia, RangoHorario } from "../../types"

interface ScheduleManagerProps {
  professional: Profesional
  onScheduleUpdate?: (horarios: HorariosSemanales) => void
}

const diasSemana = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
] as const

const horariosPorDefecto: HorariosSemanales = {
  lunes: { activo: true, rangos: [{ inicio: "09:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }] },
  martes: { activo: true, rangos: [{ inicio: "09:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }] },
  miercoles: { activo: true, rangos: [{ inicio: "09:00", fin: "12:00" }, { inicio: "14:00", fin: "16:00" }] },
  jueves: { activo: true, rangos: [{ inicio: "09:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }] },
  viernes: { activo: true, rangos: [{ inicio: "10:00", fin: "12:30" }, { inicio: "14:00", fin: "16:30" }] },
  sabado: { activo: false, rangos: [{ inicio: "09:00", fin: "13:00" }] },
  domingo: { activo: false, rangos: [{ inicio: "00:00", fin: "00:00" }] },
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ professional, onScheduleUpdate }) => {
  const { toast } = useToast()
  const [horarios, setHorarios] = useState<HorariosSemanales>(horariosPorDefecto)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSchedules()
  }, [professional.id])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await profesionalesApi.obtenerHorarios(professional.id)
      setHorarios(response.horarios)
    } catch (error) {
      console.error("Error fetching schedules:", error)
      setHorarios(horariosPorDefecto)
    } finally {
      setLoading(false)
    }
  }

  const validateTime = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  const validateSchedule = (dia: string, horario: HorarioDia): string | null => {
    if (!horario.activo) return null

    if (!horario.rangos || horario.rangos.length === 0) {
      return "Debe especificar al menos un rango de horario"
    }

    for (let i = 0; i < horario.rangos.length; i++) {
      const rango = horario.rangos[i]

      if (!rango.inicio || !rango.fin) {
        return `Rango ${i + 1}: Debe especificar hora de inicio y fin`
      }

      if (!validateTime(rango.inicio) || !validateTime(rango.fin)) {
        return `Rango ${i + 1}: Formato de hora inválido (use HH:MM)`
      }

      const [inicioHora, inicioMin] = rango.inicio.split(":").map(Number)
      const [finHora, finMin] = rango.fin.split(":").map(Number)
      const inicioMinutos = inicioHora * 60 + inicioMin
      const finMinutos = finHora * 60 + finMin

      if (inicioMinutos >= finMinutos) {
        return `Rango ${i + 1}: La hora de inicio debe ser menor que la hora de fin`
      }

      for (let j = i + 1; j < horario.rangos.length; j++) {
        const otroRango = horario.rangos[j]
        const [otroInicioHora, otroInicioMin] = otroRango.inicio.split(":").map(Number)
        const [otroFinHora, otroFinMin] = otroRango.fin.split(":").map(Number)
        const otroInicioMinutos = otroInicioHora * 60 + otroInicioMin
        const otroFinMinutos = otroFinHora * 60 + otroFinMin

        const seSuperponen =
          (inicioMinutos < otroFinMinutos && finMinutos > otroInicioMinutos) ||
          (otroInicioMinutos < finMinutos && otroFinMinutos > inicioMinutos)

        if (seSuperponen) {
          return `Los rangos ${i + 1} y ${j + 1} se superponen`
        }
      }
    }

    return null
  }

  const handleActiveChange = (dia: keyof HorariosSemanales, activo: boolean) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        activo,
      },
    }))
    setHasChanges(true)

    if (errors[dia]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[dia]
        return newErrors
      })
    }
  }

  const handleFrequencyChange = (dia: keyof HorariosSemanales, frecuencia: "semanal" | "quincenal") => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        frecuencia,
        semana_inicio: frecuencia === "quincenal" ? (prev[dia].semana_inicio ?? 0) : undefined,
      },
    }))
    setHasChanges(true)
  }

  const handleSemanaInicioChange = (dia: keyof HorariosSemanales, semana_inicio: 0 | 1) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        semana_inicio,
      },
    }))
    setHasChanges(true)
  }

  const handleRangeChange = (
    dia: keyof HorariosSemanales,
    rangoIndex: number,
    field: keyof RangoHorario,
    value: string,
  ) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        rangos: prev[dia].rangos.map((rango, i) =>
          i === rangoIndex ? { ...rango, [field]: value } : rango
        ),
      },
    }))
    setHasChanges(true)

    if (errors[dia]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[dia]
        return newErrors
      })
    }
  }

  const handleAddRange = (dia: keyof HorariosSemanales) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        rangos: [...prev[dia].rangos, { inicio: "08:00", fin: "17:00" }],
      },
    }))
    setHasChanges(true)
  }

  const handleRemoveRange = (dia: keyof HorariosSemanales, rangoIndex: number) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        rangos: prev[dia].rangos.filter((_, i) => i !== rangoIndex),
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    const newErrors: Record<string, string> = {}

    for (const { key } of diasSemana) {
      const error = validateSchedule(key, horarios[key])
      if (error) {
        newErrors[key] = error
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setSaving(true)
      await profesionalesApi.actualizarHorarios(professional.id, horarios)
      setHasChanges(false)
      setErrors({})
      onScheduleUpdate?.(horarios)

      toast({ title: "Éxito", description: "Horarios actualizados correctamente" })
    } catch (error) {
      console.error("Error saving schedules:", error)
      toast({ variant: "destructive", title: "Error", description: "Error al guardar los horarios. Intente nuevamente." })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setHorarios(horariosPorDefecto)
    setHasChanges(true)
    setErrors({})
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horarios de Atención
          </h3>
          <p className="text-sm text-muted-foreground">
            {professional.nombre} {professional.apellido}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleReset} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving} size="sm">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {diasSemana.map(({ key, label }) => (
          <div key={key} className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-foreground">{label}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={horarios[key].activo}
                  onChange={(e) => handleActiveChange(key, e.target.checked)}
                  className="rounded border-input"
                />
                <span className="text-sm text-muted-foreground">Activo</span>
              </div>
            </div>

            {horarios[key].activo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-border/50">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Frecuencia
                    </label>
                    <select
                      value={horarios[key].frecuencia || "semanal"}
                      onChange={(e) => handleFrequencyChange(key, e.target.value as "semanal" | "quincenal")}
                      className="w-full h-9 px-3 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="semanal">Cada semana</option>
                      <option value="quincenal">Cada 15 días (quincenal)</option>
                    </select>
                  </div>

                  {horarios[key].frecuencia === "quincenal" && (
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Quincena de Inicio
                      </label>
                      <select
                        value={horarios[key].semana_inicio ?? 0}
                        onChange={(e) => handleSemanaInicioChange(key, parseInt(e.target.value) as 0 | 1)}
                        className="w-full h-9 px-3 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value={0}>Semana 1</option>
                        <option value={1}>Semana 2</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                {horarios[key].rangos.map((rango, rangoIndex) => (
                  <div key={rangoIndex} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {rangoIndex === 0 ? "Hora de inicio" : ""}
                      </label>
                      <Input
                        type="time"
                        value={rango.inicio}
                        onChange={(e) => handleRangeChange(key, rangoIndex, "inicio", e.target.value)}
                        className={errors[key] ? "border-red-500" : ""}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {rangoIndex === 0 ? "Hora de fin" : ""}
                      </label>
                      <Input
                        type="time"
                        value={rango.fin}
                        onChange={(e) => handleRangeChange(key, rangoIndex, "fin", e.target.value)}
                        className={errors[key] ? "border-red-500" : ""}
                      />
                    </div>
                    <div className="flex space-x-2">
                      {horarios[key].rangos.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveRange(key, rangoIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddRange(key)}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar horario
                </Button>
              </div>
            </div>
          )}

            {!horarios[key].activo && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No atiende este día</p>
              </div>
            )}

            {errors[key] && (
              <div className="mt-2 flex items-center text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors[key]}
              </div>
            )}
          </div>
        ))}
      </div>

      {hasChanges && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Tienes cambios sin guardar
          </div>
        </div>
      )}
    </Card>
  )
}
