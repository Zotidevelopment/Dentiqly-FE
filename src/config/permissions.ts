export type UserRole = 'admin' | 'odontologo' | 'recepcionista' | 'staff' | 'superadmin'

export interface RolePermissions {
  allowedViews: string[]
  defaultView: string
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  superadmin: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias', 'protocolos',
      'professionals', 'services', 'obras-sociales',
      'liquidaciones', 'debtors', 'cashflow',
      'usuarios', 'feriados', 'ausencias', 'sucursales', 'recordatorios', 'settings',
    ],
    defaultView: 'dashboard',
  },
  admin: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias', 'protocolos',
      'professionals', 'services', 'obras-sociales',
      'liquidaciones', 'debtors', 'cashflow',
      'usuarios', 'feriados', 'ausencias', 'sucursales', 'recordatorios', 'settings',
    ],
    defaultView: 'dashboard',
  },
  odontologo: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias', 'protocolos',
    ],
    defaultView: 'calendar',
  },
  recepcionista: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias', 'protocolos',
      'cashflow',
      'recordatorios',
    ],
    defaultView: 'calendar',
  },
  staff: {
    allowedViews: [
      'dashboard', 'calendar',
    ],
    defaultView: 'dashboard',
  },
}

/**
 * Acciones puntuales dentro de pantallas que comparten varios roles.
 * Copian los requireRole del backend (Dentiqly-BE/src/routes): si un rol no
 * puede hacer algo, el botón no se muestra en vez de fallar con "No tenés
 * permisos". Si cambia una ruta del backend, hay que cambiarlo acá también.
 */
export type Accion =
  | 'exportarPacientes'      // GET /export/pacientes
  | 'exportarTurnos'         // GET /export/turnos
  | 'registrarPagosPaciente' // POST/DELETE /cuenta-corriente/:pacienteId
  | 'enviarRecordatorios'    // POST /recordatorios/enviar(-masivo)
  | 'editarPlantillaRecordatorio' // PUT /recordatorios/template
  | 'gestionarPlan'          // pagar o reactivar la suscripción

const ACCIONES: Record<Accion, UserRole[]> = {
  exportarPacientes: ['admin', 'superadmin'],
  exportarTurnos: ['admin', 'recepcionista', 'superadmin'],
  registrarPagosPaciente: ['admin', 'recepcionista'],
  enviarRecordatorios: ['admin', 'recepcionista'],
  editarPlantillaRecordatorio: ['admin'],
  gestionarPlan: ['admin', 'superadmin'],
}

export function puede(role: string | undefined, accion: Accion): boolean {
  return !!role && ACCIONES[accion].includes(role as UserRole)
}

export function getPermissionsForRole(role: string | undefined): RolePermissions {
  if (!role) return ROLE_PERMISSIONS.staff
  return ROLE_PERMISSIONS[role as UserRole] || ROLE_PERMISSIONS.staff
}

export function canAccessView(role: string | undefined, view: string): boolean {
  const perms = getPermissionsForRole(role)
  return perms.allowedViews.includes(view)
}
