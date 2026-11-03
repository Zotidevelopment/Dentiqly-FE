/**
 * Nombre de la obra social de un paciente, con UNA sola regla para toda la app.
 *
 * Gana la obra social vinculada por id (la que usan liquidaciones, caja y
 * estadísticas); si no hay, el texto libre que escribió el paciente en la
 * reserva online; si no hay ninguna, el fallback.
 *
 * Antes cada pantalla elegía su propio orden y un mismo paciente mostraba una
 * obra social en el listado y otra distinta en su ficha. No volver a escribir
 * `obraSocial?.nombre || obra_social_nombre_custom` a mano: usar esta función.
 */
interface ConObraSocial {
  obraSocial?: { nombre?: string | null } | null
  obra_social_nombre_custom?: string | null
}

export const PARTICULAR = "Particular"

export function getObraSocialNombre(
  paciente: ConObraSocial | null | undefined,
  fallback: string = PARTICULAR,
): string {
  const vinculada = paciente?.obraSocial?.nombre?.trim()
  if (vinculada) return vinculada
  const escrita = paciente?.obra_social_nombre_custom?.trim()
  if (escrita) return escrita
  return fallback
}

/** true si el paciente tiene alguna obra social (vinculada o escrita). */
export function tieneObraSocial(paciente: ConObraSocial | null | undefined): boolean {
  return getObraSocialNombre(paciente, "") !== ""
}
