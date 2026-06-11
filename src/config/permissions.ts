export type UserRole = 'admin' | 'odontologo' | 'recepcionista' | 'staff' | 'superadmin'

export interface RolePermissions {
  allowedViews: string[]
  defaultView: string
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  superadmin: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias',
      'professionals', 'services', 'obras-sociales',
      'liquidaciones', 'debtors', 'cashflow',
      'usuarios', 'feriados', 'ausencias', 'sucursales', 'recordatorios', 'settings',
    ],
    defaultView: 'dashboard',
  },
  admin: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias',
      'professionals', 'services', 'obras-sociales',
      'liquidaciones', 'debtors', 'cashflow',
      'usuarios', 'feriados', 'ausencias', 'sucursales', 'recordatorios', 'settings',
    ],
    defaultView: 'dashboard',
  },
  odontologo: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias',
    ],
    defaultView: 'calendar',
  },
  recepcionista: {
    allowedViews: [
      'dashboard', 'calendar', 'patients', 'asistencias',
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

export function getPermissionsForRole(role: string | undefined): RolePermissions {
  if (!role) return ROLE_PERMISSIONS.staff
  return ROLE_PERMISSIONS[role as UserRole] || ROLE_PERMISSIONS.staff
}

export function canAccessView(role: string | undefined, view: string): boolean {
  const perms = getPermissionsForRole(role)
  return perms.allowedViews.includes(view)
}
