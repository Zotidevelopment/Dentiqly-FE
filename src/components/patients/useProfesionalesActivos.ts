import { useEffect, useState } from "react"
import { profesionalesApi } from "../../api"

export interface ProfesionalOpcion {
  id: number
  nombre: string
  apellido: string
}

/**
 * Profesionales activos de la clínica para elegir quién firmó una historia
 * clínica, una receta o un odontograma.
 *
 * Antes cada sección tomaba "el primer profesional activo" (o directamente el
 * id 1, que en una plataforma multi-clínica es el profesional de OTRA clínica)
 * y así quedaba registrado aunque hubiera atendido otra persona.
 */
export function useProfesionalesActivos() {
  const [profesionales, setProfesionales] = useState<ProfesionalOpcion[]>([])

  useEffect(() => {
    let vigente = true
    profesionalesApi
      .listar({ estado: "Activo", limit: 100 })
      .then((res) => {
        const lista: ProfesionalOpcion[] = Array.isArray(res) ? res : res?.data || []
        if (vigente) setProfesionales(lista.map((p) => ({ id: p.id, nombre: p.nombre, apellido: p.apellido })))
      })
      .catch(() => {})
    return () => {
      vigente = false
    }
  }, [])

  return profesionales
}

export const nombreProfesional = (p: ProfesionalOpcion) => `${p.nombre} ${p.apellido}`.trim()
