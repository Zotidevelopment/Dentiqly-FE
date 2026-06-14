import { Turno, Paciente, Profesional, Servicio, ObraSocial, HistorialClinico, Odontograma } from "../types"

// Claves de localStorage para persistir las acciones en la demo
const STORAGE_PREFIX = "dentiqly_demo_"
const KEYS = {
  PACIENTES: `${STORAGE_PREFIX}pacientes`,
  TURNOS: `${STORAGE_PREFIX}turnos`,
  PROFESIONALES: `${STORAGE_PREFIX}profesionales`,
  SERVICIOS: `${STORAGE_PREFIX}servicios`,
  OBRAS_SOCIALES: `${STORAGE_PREFIX}obras_sociales`,
  SUCURSALES: `${STORAGE_PREFIX}sucursales`,
  MOVIMIENTOS: `${STORAGE_PREFIX}movimientos`,
  LIQUIDACIONES: `${STORAGE_PREFIX}liquidaciones`,
  HISTORIALES: `${STORAGE_PREFIX}historiales`,
  ODONTOGRAMAS: `${STORAGE_PREFIX}odontogramas`,
  CONFIG: `${STORAGE_PREFIX}config`,
  FERIADOS: `${STORAGE_PREFIX}feriados`,
  AUSENCIAS: `${STORAGE_PREFIX}ausencias`,
}

// Versión de base de datos para forzar refresco cuando actualizamos datos mock
const DEMO_VERSION = "v7"

// Inicialización de datos por defecto si no existen
const getTodayDateStr = (offsetDays = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split("T")[0]
}

const defaultObrasSociales: ObraSocial[] = [
  { id: 1, nombre: "OSDE 310", activo: true, codigo: "OSDE310" },
  { id: 2, nombre: "Swiss Medical", activo: true, codigo: "SMG" },
  { id: 3, nombre: "Galeno Oro", activo: true, codigo: "GALENO" },
  { id: 4, nombre: "Particular", activo: true, codigo: "PART" },
]

const defaultSucursales = [
  { id: 1, nombre: "Sede Belgrano", direccion: "Av. Cabildo 1842, CABA", activo: true },
  { id: 2, nombre: "Sede Palermo", direccion: "Av. Santa Fe 3421, CABA", activo: true },
]

const defaultProfesionales: Profesional[] = [
  {
    id: 1,
    nombre: "Lucas",
    apellido: "Díaz",
    numero_documento: "34222111",
    numero_matricula: "M-4512",
    especialidad: "Ortodoncia & Gral",
    telefono: "11-4567-8901",
    email: "lucas.diaz@dentiqly.com",
    estado: "Activo",
    color: "#2563FF", // Azul dental
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: "Sofía",
    apellido: "Silva",
    numero_documento: "36111222",
    numero_matricula: "M-7832",
    especialidad: "Odontopediatría",
    telefono: "11-2345-6789",
    email: "sofia.silva@dentiqly.com",
    estado: "Activo",
    color: "#10B981", // Esmeralda
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "Mendoza",
    numero_documento: "31000999",
    numero_matricula: "M-3211",
    especialidad: "Implantes & Cirugía",
    telefono: "11-9876-5432",
    email: "carlos.mendoza@dentiqly.com",
    estado: "Activo",
    color: "#8B5CF6", // Violeta
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultServicios: Servicio[] = [
  {
    id: 1,
    nombre: "Consulta Diagnóstico",
    categoria: "General",
    precio_base: 4500,
    duracion_estimada: 30,
    estado: "Activo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: "Limpieza + Fluoración",
    categoria: "Preventiva",
    precio_base: 7000,
    duracion_estimada: 30,
    estado: "Activo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: "Tratamiento de Ortodoncia",
    categoria: "Especialidad",
    precio_base: 14000,
    duracion_estimada: 45,
    estado: "Activo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    nombre: "Implante Dental Titanio",
    categoria: "Cirugía",
    precio_base: 55000,
    duracion_estimada: 60,
    estado: "Activo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultPacientes: Paciente[] = [
  {
    id: "pac-1",
    nombre: "Carlos",
    apellido: "Sánchez",
    tipo_documento: "DNI",
    numero_documento: "22333444",
    fecha_nacimiento: "1978-07-15",
    sexo: "Masculino",
    telefono: "11-3333-4444",
    email: "carlos.sanchez@gmail.com",
    condicion: "Activo",
    obra_social_id: 1,
    obraSocial: { id: 1, nombre: "OSDE 310" },
    tipo_facturacion: "B",
    etiquetas: ["Ortodoncia", "Frecuente", "Implantes"],
    direccion: "Av. Del Libertador 2420, Piso 5A, CABA",
    ocupacion: "Abogado",
    recomendado_por: "Dr. Lucas Díaz",
    numero_afiliado: "OSDE-310-987654",
    foto_url: "/assets/carlos-sanchez.png",
    condicion_iva: "Consumidor Final",
    contacto_emergencia: "Marta Sánchez (Esposa)",
    telefono_emergencia: "11-5555-6666",
    numero_facturacion: "20-22333444-9",
    informacion_adicional: "Paciente de cuidado. Refiere ligera sensibilidad gingival crónica. Excelente adherencia al tratamiento de ortodoncia.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pac-2",
    nombre: "Sofía",
    apellido: "García",
    tipo_documento: "DNI",
    numero_documento: "34999888",
    fecha_nacimiento: "1989-11-22",
    sexo: "Femenino",
    telefono: "11-7777-8888",
    email: "sofia.garcia@yahoo.com",
    condicion: "Activo",
    obra_social_id: 2,
    obraSocial: { id: 2, nombre: "Swiss Medical" },
    tipo_facturacion: "B",
    etiquetas: ["Estética", "Sensible"],
    direccion: "Palpa 2341, Belgrano, CABA",
    ocupacion: "Arquitecta",
    numero_afiliado: "SMG-420-551122",
    informacion_adicional: "Sensibilidad al frío. Solicita anestesia tópica siempre.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pac-3",
    nombre: "Santiago",
    apellido: "Herrera",
    tipo_documento: "DNI",
    numero_documento: "33010010",
    fecha_nacimiento: "1987-06-24",
    sexo: "Masculino",
    telefono: "341-1010-1010",
    email: "santiago.herrera@gmail.com",
    condicion: "Activo",
    obra_social_id: 4,
    obraSocial: { id: 4, nombre: "Particular" },
    tipo_facturacion: "C",
    etiquetas: ["VIP", "Implantes"],
    direccion: "Av. Pellegrini 1420, Rosario, Santa Fe",
    ocupacion: "Administrador",
    informacion_adicional: "Controlar implante de pieza 11. Requiere atención prioritaria.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pac-4",
    nombre: "Mariana",
    apellido: "López",
    tipo_documento: "DNI",
    numero_documento: "39123456",
    fecha_nacimiento: "1995-04-03",
    sexo: "Femenino",
    telefono: "11-8888-9999",
    email: "mariana.lopez@outlook.com",
    condicion: "Activo",
    obra_social_id: 3,
    obraSocial: { id: 3, nombre: "Galeno Oro" },
    tipo_facturacion: "B",
    etiquetas: ["Control"],
    direccion: "Av. Santa Fe 1540, Palermo, CABA",
    ocupacion: "Diseñadora",
    numero_afiliado: "GAL-998877",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Generador de turnos relativos al día de hoy para llenar el dashboard
const generateDefaultTurnos = (): Turno[] => {
  const t1 = getTodayDateStr()
  const tPrev1 = getTodayDateStr(-1)
  const tPrev2 = getTodayDateStr(-2)
  const tPrev3 = getTodayDateStr(-3)
  const tNext1 = getTodayDateStr(1)

  return [
    {
      id: 101,
      paciente_id: "pac-1",
      profesional_id: 1,
      servicio_id: 3,
      fecha: t1,
      hora_inicio: "09:00",
      hora_fin: "09:45",
      estado: "Atendido",
      precio_final: 14000,
      pago_confirmado: true,
      paciente: defaultPacientes[0],
      profesional: defaultProfesionales[0],
      servicio: defaultServicios[2],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 102,
      paciente_id: "pac-2",
      profesional_id: 2,
      servicio_id: 2,
      fecha: t1,
      hora_inicio: "11:30",
      hora_fin: "12:00",
      estado: "Confirmado",
      precio_final: 7000,
      pago_confirmado: false,
      paciente: defaultPacientes[1],
      profesional: defaultProfesionales[1],
      servicio: defaultServicios[1],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 103,
      paciente_id: "pac-3",
      profesional_id: 3,
      servicio_id: 4,
      fecha: t1,
      hora_inicio: "14:00",
      hora_fin: "15:00",
      estado: "Pendiente",
      precio_final: 55000,
      pago_confirmado: false,
      paciente: defaultPacientes[2],
      profesional: defaultProfesionales[2],
      servicio: defaultServicios[3],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 104,
      paciente_id: "pac-4",
      profesional_id: 1,
      servicio_id: 1,
      fecha: t1,
      hora_inicio: "16:30",
      hora_fin: "17:00",
      estado: "Pendiente",
      precio_final: 4500,
      pago_confirmado: false,
      paciente: defaultPacientes[3],
      profesional: defaultProfesionales[0],
      servicio: defaultServicios[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 105,
      paciente_id: "pac-1",
      profesional_id: 1,
      servicio_id: 3,
      fecha: tPrev1,
      hora_inicio: "10:00",
      hora_fin: "10:45",
      estado: "Atendido",
      precio_final: 14000,
      pago_confirmado: true,
      paciente: defaultPacientes[0],
      profesional: defaultProfesionales[0],
      servicio: defaultServicios[2],
      createdAt: new Date().toISOString(),
    } as any,
    {
      id: 106,
      paciente_id: "pac-2",
      profesional_id: 2,
      servicio_id: 1,
      fecha: tPrev1,
      hora_inicio: "15:00",
      hora_fin: "15:30",
      estado: "Atendido",
      precio_final: 4500,
      pago_confirmado: true,
      paciente: defaultPacientes[1],
      profesional: defaultProfesionales[1],
      servicio: defaultServicios[0],
      createdAt: new Date().toISOString(),
    } as any,
    {
      id: 107,
      paciente_id: "pac-3",
      profesional_id: 3,
      servicio_id: 4,
      fecha: tPrev2,
      hora_inicio: "11:00",
      hora_fin: "12:00",
      estado: "Atendido",
      precio_final: 55000,
      pago_confirmado: true,
      paciente: defaultPacientes[2],
      profesional: defaultProfesionales[2],
      servicio: defaultServicios[3],
      createdAt: new Date().toISOString(),
    } as any,
    {
      id: 108,
      paciente_id: "pac-4",
      profesional_id: 2,
      servicio_id: 2,
      fecha: tPrev2,
      hora_inicio: "09:30",
      hora_fin: "10:00",
      estado: "Ausente",
      precio_final: 7000,
      pago_confirmado: false,
      paciente: defaultPacientes[3],
      profesional: defaultProfesionales[1],
      servicio: defaultServicios[1],
      createdAt: new Date().toISOString(),
    } as any,
    {
      id: 109,
      paciente_id: "pac-1",
      profesional_id: 1,
      servicio_id: 1,
      fecha: tPrev3,
      hora_inicio: "16:00",
      hora_fin: "16:30",
      estado: "Atendido",
      precio_final: 4500,
      pago_confirmado: true,
      paciente: defaultPacientes[0],
      profesional: defaultProfesionales[0],
      servicio: defaultServicios[0],
      createdAt: new Date().toISOString(),
    } as any,
    {
      id: 110,
      paciente_id: "pac-2",
      profesional_id: 2,
      servicio_id: 3,
      fecha: tNext1,
      hora_inicio: "10:30",
      hora_fin: "11:15",
      estado: "Confirmado",
      precio_final: 14000,
      pago_confirmado: false,
      paciente: defaultPacientes[1],
      profesional: defaultProfesionales[1],
      servicio: defaultServicios[2],
      createdAt: new Date().toISOString(),
    } as any,
  ]
}

const defaultMovimientos = [
  // Movimientos de Carlos Sánchez (pac-1) para Cuenta Corriente completa
  { id: 1, paciente_id: "pac-1", tipo: "Deuda", monto: "14000.00", descripcion: "Tratamiento Ortodoncia Damon (Mes Feb)", fecha: getTodayDateStr(-90), createdAt: new Date().toISOString() },
  { id: 2, paciente_id: "pac-1", tipo: "Ingreso", monto: "14000.00", forma_pago: "Efectivo", descripcion: "Pago Ortodoncia Damon (Mes Feb)", fecha: getTodayDateStr(-85), createdAt: new Date().toISOString() },
  { id: 3, paciente_id: "pac-1", tipo: "Deuda", monto: "14000.00", descripcion: "Tratamiento Ortodoncia Damon (Mes Mar)", fecha: getTodayDateStr(-60), createdAt: new Date().toISOString() },
  { id: 4, paciente_id: "pac-1", tipo: "Ingreso", monto: "14000.00", forma_pago: "Transferencia", descripcion: "Pago Ortodoncia Damon (Mes Mar)", fecha: getTodayDateStr(-55), createdAt: new Date().toISOString() },
  { id: 5, paciente_id: "pac-1", tipo: "Deuda", monto: "45000.00", descripcion: "Corona Zirconio Diente 46", fecha: getTodayDateStr(-30), createdAt: new Date().toISOString() },
  { id: 6, paciente_id: "pac-1", tipo: "Ingreso", monto: "30000.00", forma_pago: "Tarjeta", descripcion: "Seña Corona Zirconio Diente 46", fecha: getTodayDateStr(-28), createdAt: new Date().toISOString() },
  { id: 7, paciente_id: "pac-1", tipo: "Deuda", monto: "14000.00", descripcion: "Tratamiento Ortodoncia Damon (Mes Abr)", fecha: getTodayDateStr(-20), createdAt: new Date().toISOString() },
  { id: 8, paciente_id: "pac-1", tipo: "Deuda", monto: "14000.00", descripcion: "Tratamiento Ortodoncia Damon (Mes May)", fecha: getTodayDateStr(-2), createdAt: new Date().toISOString() },

  // Otros
  { id: 9, paciente_id: "pac-2", tipo: "Ingreso", monto: "4500.00", forma_pago: "Tarjeta", descripcion: "Consulta diagnóstica", fecha: getTodayDateStr(-1), createdAt: new Date().toISOString() },
  { id: 10, paciente_id: "pac-3", tipo: "Ingreso", monto: "55000.00", forma_pago: "Transferencia", descripcion: "Seña implante", fecha: getTodayDateStr(-2), createdAt: new Date().toISOString() },
  { id: 11, paciente_id: "", tipo: "Egreso", monto: "12000.00", forma_pago: "Efectivo", descripcion: "Insumos dentales (Guantes/Anestesia)", fecha: getTodayDateStr(-1), createdAt: new Date().toISOString() },
  { id: 12, paciente_id: "", tipo: "Egreso", monto: "8500.00", forma_pago: "Transferencia", descripcion: "Servicio de limpieza", fecha: getTodayDateStr(-3), createdAt: new Date().toISOString() },
]

const defaultLiquidaciones = [
  {
    id: 1,
    profesional_id: 1,
    periodo_inicio: getTodayDateStr(-30),
    periodo_fin: getTodayDateStr(),
    monto_total_servicios: 28000,
    monto_profesional: 14000,
    cantidad_prestaciones: 2,
    estado: "Pendiente",
    profesional: defaultProfesionales[0],
    createdAt: new Date().toISOString(),
  },
]

const defaultFeriados = [
  { id: 1, fecha: "2026-01-01", descripcion: "Año Nuevo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, fecha: "2026-03-24", descripcion: "Día Nacional de la Memoria", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, fecha: "2026-04-02", descripcion: "Día del Veterano", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, fecha: "2026-05-01", descripcion: "Día del Trabajador", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 5, fecha: "2026-05-25", descripcion: "Revolución de Mayo", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 6, fecha: "2026-06-20", descripcion: "Día de la Bandera", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 7, fecha: "2026-07-09", descripcion: "Día de la Independencia", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 8, fecha: "2026-12-25", descripcion: "Navidad", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

const defaultAusencias = [
  {
    id: 1,
    profesional_id: 2,
    fecha_inicio: getTodayDateStr(2),
    fecha_fin: getTodayDateStr(2),
    hora_inicio: "09:00",
    hora_fin: "13:00",
    motivo: "Congreso Odontológico",
    profesional: { id: 2, nombre: "Sofía", apellido: "Silva" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const defaultHistoriales: HistorialClinico[] = [
  {
    id: 501,
    paciente_id: "pac-1",
    fecha: getTodayDateStr(),
    motivo_consulta: "Control mensual de ortodoncia",
    diagnostico: "Progreso alineación favorable",
    tratamiento: "Cambio de ligaduras elásticas a color azul y ajuste menor de arco superior.",
    observaciones: "Paciente presenta buena higiene.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 502,
    paciente_id: "pac-1",
    fecha: getTodayDateStr(-15),
    motivo_consulta: "Cementado de corona sobre perno",
    diagnostico: "Perno muñón colado listo para corona",
    tratamiento: "Prueba, ajuste de oclusión y cementado definitivo de corona de zirconio estético en pieza 46.",
    observaciones: "Oclusión verificada. Sin interferencias.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 503,
    paciente_id: "pac-1",
    fecha: getTodayDateStr(-30),
    motivo_consulta: "Control y preparación de perno",
    diagnostico: "Diente endodonciado asintomático",
    tratamiento: "Tallado de conducto y toma de impresión para perno muñón metálico en pieza 46.",
    observaciones: "Higiene regular.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 504,
    paciente_id: "pac-1",
    fecha: getTodayDateStr(-60),
    motivo_consulta: "Tratamiento de conducto (Endodoncia)",
    diagnostico: "Pulpitis irreversible irreversible en pieza 46",
    tratamiento: "Endodoncia multirradicular pieza 46: extirpación pulpar, instrumentación y obturación de conductos.",
    observaciones: "Radiografía de control post-obturación satisfactoria.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 505,
    paciente_id: "pac-1",
    fecha: getTodayDateStr(-90),
    motivo_consulta: "Inicio de tratamiento de ortodoncia",
    diagnostico: "Maloclusión Clase I con apiñamiento leve superior",
    tratamiento: "Cementado de brackets metálicos Damon en arcada superior completa de canino a canino. Arco inicial 0.14 NiTi.",
    observaciones: "Se instruye en técnicas de cepillado ortodóncico.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 506,
    paciente_id: "pac-1",
    fecha: getTodayDateStr(-100),
    motivo_consulta: "Limpieza periodontal profunda",
    diagnostico: "Gingivitis inducida por placa",
    tratamiento: "Tartrectomía con ultrasonido, raspaje supra y subgingival sectorizado y profilaxis.",
    observaciones: "Encías inflamadas con tendencia al sangrado. Se prescribe enjuague con clorhexidina.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 507,
    paciente_id: "pac-2",
    fecha: getTodayDateStr(-15),
    motivo_consulta: "Limpieza anual recomendada",
    diagnostico: "Placa blanda leve, sin caries activas",
    tratamiento: "Limpieza con ultrasonido, profilaxis y aplicación tópica de flúor",
    observaciones: "Encías sanas.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 508,
    paciente_id: "pac-3",
    fecha: getTodayDateStr(-2),
    motivo_consulta: "Pérdida de pieza dentaria 11",
    diagnostico: "Ausencia de pieza 11 por traumatismo antiguo",
    tratamiento: "Estudio tomográfico, planificación de implante de titanio",
    observaciones: "Hueso remanente adecuado para colocación directa.",
    createdAt: new Date().toISOString(),
  },
]

const defaultOdontogramas: Odontograma[] = [
  {
    id: 601,
    paciente_id: "pac-1",
    profesional_id: 1,
    fecha: getTodayDateStr(-90),
    tipo: "Inicial",
    dientes_data: {
      "4.6": { estado: "mal_estado", tratamiento_general: { tratamiento: "tratamiento_endodontico", estado: "mal_estado" }, superficies: { oclusal: "mal_estado", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" } },
      "1.8": { estado: "mal_estado", tratamiento_general: { tratamiento: "ausente", estado: "mal_estado" }, superficies: { oclusal: "sano", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" } },
      "1.4": { estado: "mal_estado", superficies: { oclusal: "mal_estado", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" }, tratamientos: { oclusal: { tratamiento: "caries", estado: "mal_estado" } } },
      "2.6": { estado: "buen_estado", tratamiento_general: { tratamiento: "implante", estado: "buen_estado" }, superficies: { oclusal: "sano", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" } },
    },
    observaciones: "Odontograma inicial completo. Brackets colocados, pieza 4.6 tratada con perno y corona, 1.4 caries oclusal activa y 2.6 implante verificado.",
  },
  {
    id: 602,
    paciente_id: "pac-3",
    profesional_id: 3,
    fecha: getTodayDateStr(-2),
    tipo: "Tratamiento",
    dientes_data: {
      "1.1": { estado: "buen_estado", tratamiento_general: { tratamiento: "implante", estado: "buen_estado" }, superficies: { oclusal: "sano", vestibular: "sano", lingual: "sano", mesial: "sano", distal: "sano" } },
    },
    observaciones: "Corona provisional sobre implante colocada hoy en pieza 1.1.",
  },
]

// Generador dinámico de turnos deterministas para llenar la agenda en cualquier mes solicitado
const getDynamicTurnosForRange = (desdeStr: string, hastaStr: string): Turno[] => {
  const turnos: Turno[] = []
  const start = new Date(desdeStr + "T00:00:00")
  const end = new Date(hastaStr + "T23:59:59")

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return []
  }

  const pacs = getStorageItem(KEYS.PACIENTES, defaultPacientes)
  const profs = getStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
  const servs = getStorageItem(KEYS.SERVICIOS, defaultServicios)

  const schedulesProf1 = [
    { hora: "08:00", duracion: 45, pacIdx: 0, servIdx: 0, estado: "Atendido" },
    { hora: "09:00", duracion: 30, pacIdx: 1, servIdx: 1, estado: "Confirmado" },
    { hora: "09:30", duracion: 45, pacIdx: 2, servIdx: 2, estado: "Atendido" },
    { hora: "10:30", duracion: 30, pacIdx: 3, servIdx: 3, estado: "Confirmado" },
    { hora: "11:00", duracion: 60, pacIdx: 0, servIdx: 2, estado: "Atendido" },
    { hora: "13:00", duracion: 45, pacIdx: 1, servIdx: 0, estado: "Confirmado" },
    { hora: "14:00", duracion: 30, pacIdx: 2, servIdx: 1, estado: "Confirmado" },
    { hora: "14:30", duracion: 45, pacIdx: 3, servIdx: 2, estado: "Pendiente" },
    { hora: "15:30", duracion: 30, pacIdx: 0, servIdx: 3, estado: "Pendiente" },
    { hora: "16:30", duracion: 60, pacIdx: 1, servIdx: 2, estado: "Pendiente" },
    { hora: "18:00", duracion: 30, pacIdx: 2, servIdx: 0, estado: "Ausente" },
    { hora: "19:00", duracion: 45, pacIdx: 3, servIdx: 1, estado: "Pendiente" },
  ]

  const schedulesProf2 = [
    { hora: "08:30", duracion: 30, pacIdx: 1, servIdx: 1, estado: "Atendido" },
    { hora: "09:30", duracion: 45, pacIdx: 2, servIdx: 2, estado: "Confirmado" },
    { hora: "10:30", duracion: 30, pacIdx: 3, servIdx: 0, estado: "Atendido" },
    { hora: "11:30", duracion: 45, pacIdx: 0, servIdx: 1, estado: "Confirmado" },
    { hora: "13:30", duracion: 30, pacIdx: 1, servIdx: 2, estado: "Confirmado" },
    { hora: "14:30", duracion: 45, pacIdx: 2, servIdx: 3, estado: "Pendiente" },
    { hora: "15:30", duracion: 30, pacIdx: 3, servIdx: 0, estado: "Pendiente" },
    { hora: "16:00", duracion: 60, pacIdx: 0, servIdx: 2, estado: "Pendiente" },
    { hora: "17:30", duracion: 30, pacIdx: 1, servIdx: 1, estado: "Ausente" },
    { hora: "18:30", duracion: 45, pacIdx: 2, servIdx: 3, estado: "Pendiente" },
  ]

  const schedulesProf3 = [
    { hora: "09:00", duracion: 60, pacIdx: 2, servIdx: 3, estado: "Atendido" },
    { hora: "10:00", duracion: 30, pacIdx: 3, servIdx: 0, estado: "Confirmado" },
    { hora: "10:30", duracion: 45, pacIdx: 0, servIdx: 1, estado: "Atendido" },
    { hora: "11:30", duracion: 30, pacIdx: 1, servIdx: 2, estado: "Confirmado" },
    { hora: "13:00", duracion: 60, pacIdx: 2, servIdx: 3, estado: "Confirmado" },
    { hora: "14:30", duracion: 30, pacIdx: 3, servIdx: 0, estado: "Pendiente" },
    { hora: "15:00", duracion: 45, pacIdx: 0, servIdx: 1, estado: "Pendiente" },
    { hora: "16:00", duracion: 30, pacIdx: 1, servIdx: 2, estado: "Pendiente" },
    { hora: "17:00", duracion: 45, pacIdx: 2, servIdx: 3, estado: "Pendiente" },
    { hora: "18:00", duracion: 60, pacIdx: 3, servIdx: 2, estado: "Pendiente" },
  ]

  const curr = new Date(start)
  let idCounter = 10000

  while (curr <= end) {
    if (curr.getDay() !== 0) {
      const dateStr = curr.toISOString().split("T")[0]
      const seed = curr.getDate()

      const takeP1 = 4 + (seed % 3)
      const takeP2 = 4 + ((seed + 2) % 3)
      const takeP3 = 4 + ((seed + 4) % 3)

      const addAppsForProf = (profId: number, schedules: any[], takeCount: number) => {
        const offset = seed % schedules.length
        for (let i = 0; i < takeCount; i++) {
          const s = schedules[(offset + i) % schedules.length]
          const [h, m] = s.hora.split(":").map(Number)
          const totalMin = h * 60 + m + s.duracion
          const fh = Math.floor(totalMin / 60)
          const fm = totalMin % 60
          const horaFin = `${String(fh).padStart(2, "0")}:${String(fm).padStart(2, "0")}`

          const patient = pacs[s.pacIdx % pacs.length]
          const professional = profs.find((p) => p.id === profId) || profs[0]
          const service = servs[s.servIdx % servs.length]

          turnos.push({
            id: idCounter++,
            paciente_id: patient.id,
            profesional_id: professional.id,
            servicio_id: service.id,
            fecha: dateStr,
            hora_inicio: s.hora,
            hora_fin: horaFin,
            estado: s.estado,
            precio_final: service.precio_base,
            pago_confirmado: s.estado === "Atendido",
            paciente: patient,
            profesional: professional,
            servicio: service,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      }

      addAppsForProf(1, schedulesProf1, takeP1)
      addAppsForProf(2, schedulesProf2, takeP2)
      addAppsForProf(3, schedulesProf3, takeP3)
    }
    curr.setDate(curr.getDate() + 1)
  }

  return turnos
}

const defaultConfig = [
  { clave: "clinic_address", valor: "Av. Cabildo 1842, Belgrano, CABA" },
  { clave: "clinic_phone", valor: "+54 11 4788-1234" },
  { clave: "business_hours", valor: JSON.stringify({
      lunes: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
      martes: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
      miercoles: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
      jueves: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
      viernes: { activo: true, rangos: [{ inicio: "09:00", fin: "18:00" }] },
      sabado: { activo: true, rangos: [{ inicio: "09:00", fin: "13:00" }] },
      domingo: { activo: false, rangos: [] },
    })
  },
]

// Funciones helpers de lectura/escritura seguras sobre localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error("Error reading localStorage", e)
    return defaultValue
  }
}

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error("Error writing localStorage", e)
  }
}

// Inicialización de base de datos mock local
export const initMockDb = () => {
  if (typeof window !== "undefined") {
    const currentVersion = localStorage.getItem(`${STORAGE_PREFIX}version`)
    if (currentVersion !== DEMO_VERSION) {
      Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
      localStorage.setItem(`${STORAGE_PREFIX}version`, DEMO_VERSION)
    }
  }

  if (!localStorage.getItem(KEYS.PACIENTES)) setStorageItem(KEYS.PACIENTES, defaultPacientes)
  if (!localStorage.getItem(KEYS.PROFESIONALES)) setStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
  if (!localStorage.getItem(KEYS.SERVICIOS)) setStorageItem(KEYS.SERVICIOS, defaultServicios)
  if (!localStorage.getItem(KEYS.OBRAS_SOCIALES)) setStorageItem(KEYS.OBRAS_SOCIALES, defaultObrasSociales)
  if (!localStorage.getItem(KEYS.SUCURSALES)) setStorageItem(KEYS.SUCURSALES, defaultSucursales)
  if (!localStorage.getItem(KEYS.TURNOS)) setStorageItem(KEYS.TURNOS, generateDefaultTurnos())
  if (!localStorage.getItem(KEYS.MOVIMIENTOS)) setStorageItem(KEYS.MOVIMIENTOS, defaultMovimientos)
  if (!localStorage.getItem(KEYS.LIQUIDACIONES)) setStorageItem(KEYS.LIQUIDACIONES, defaultLiquidaciones)
  if (!localStorage.getItem(KEYS.HISTORIALES)) setStorageItem(KEYS.HISTORIALES, defaultHistoriales)
  if (!localStorage.getItem(KEYS.ODONTOGRAMAS)) setStorageItem(KEYS.ODONTOGRAMAS, defaultOdontogramas)
  if (!localStorage.getItem(KEYS.CONFIG)) setStorageItem(KEYS.CONFIG, defaultConfig)
  if (!localStorage.getItem(KEYS.FERIADOS)) setStorageItem(KEYS.FERIADOS, defaultFeriados)
  if (!localStorage.getItem(KEYS.AUSENCIAS)) setStorageItem(KEYS.AUSENCIAS, defaultAusencias)
}

// Inicializar de inmediato para la demo
if (typeof window !== "undefined") {
  initMockDb()
}

// MOTOR DE MOCKS (SIMULADOR DE ENDPOINTS)
export const handleMockRequest = async (endpoint: string, method: string, body?: any): Promise<any> => {
  // Simular latencia de red aleatoria entre 100ms y 250ms
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 150))

  // Limpiar el endpoint para evaluar
  const url = new URL(endpoint, "http://demo-domain.com")
  const path = url.pathname
  const query = url.searchParams

  // 1. BILLING STATUS
  if (path === "/api/billing/status") {
    return {
      subscription_status: "active",
      nombre: "Clínica Dental Demo",
      slug: "demo",
      trial_ends_at: null,
      trial_days_remaining: 30,
      show_trial_warning: false,
    }
  }

  // 2. CONFIGURACION
  if (path === "/api/configuracion") {
    const config = getStorageItem(KEYS.CONFIG, defaultConfig)
    if (method === "GET") return config
    if (method === "POST" || method === "PUT") {
      // Actualizar clave específica
      const updated = config.map((c) => (c.clave === body.clave ? { ...c, valor: body.valor } : c))
      if (!config.find((c) => c.clave === body.clave)) {
        updated.push({ clave: body.clave, valor: body.valor })
      }
      setStorageItem(KEYS.CONFIG, updated)
      return body
    }
  }

  // ONBOARDING STATUS
  if (path === "/api/onboarding/status") {
    return {
      hasHistoriaClinica: true,
      hasOdontograma: true,
      hasPrescripcion: true,
      hasTratamiento: true,
      hasArchivos: false,
      hasCuentaCorriente: true,
    }
  }

  // 3. PROFESIONALES
  if (path === "/api/profesionales") {
    const profs = getStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
    if (method === "GET") {
      return { profesionales: profs, data: profs, pagination: { total: profs.length, page: 1, limit: 100, totalPages: 1 } }
    }
    if (method === "POST") {
      const nuevo: Profesional = {
        ...body,
        id: profs.length + 1,
        estado: "Activo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      profs.push(nuevo)
      setStorageItem(KEYS.PROFESIONALES, profs)
      return nuevo
    }
  }
  if (path.startsWith("/api/profesionales/")) {
    const profs = getStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
    const segments = path.replace("/api/profesionales/", "").split("/")
    const id = parseInt(segments[0] || "0")

    if (path.endsWith("/horarios-disponibles")) {
      return {
        disponible: true,
        mensaje: "Horarios cargados",
        horarios_disponibles: ["09:00", "09:45", "10:30", "11:15", "13:00", "13:45", "14:30", "15:15", "16:00", "16:45"],
      }
    }

    if (path.endsWith("/horarios")) {
      return {
        horarios: {
          lunes: { activo: true, frecuencia: "semanal", rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "19:00" }] },
          martes: { activo: true, frecuencia: "semanal", rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "19:00" }] },
          miercoles: { activo: true, frecuencia: "semanal", rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "19:00" }] },
          jueves: { activo: true, frecuencia: "semanal", rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "19:00" }] },
          viernes: { activo: true, frecuencia: "semanal", rangos: [{ inicio: "09:00", fin: "13:00" }, { inicio: "14:00", fin: "18:00" }] },
          sabado: { activo: true, frecuencia: "semanal", rangos: [{ inicio: "09:00", fin: "13:00" }] },
          domingo: { activo: false, frecuencia: "semanal", rangos: [] },
        }
      }
    }

    const idx = profs.findIndex((p) => p.id === id)
    if (method === "GET") return profs[idx] || null
    if (method === "PUT") {
      profs[idx] = { ...profs[idx], ...body, updatedAt: new Date().toISOString() }
      setStorageItem(KEYS.PROFESIONALES, profs)
      return profs[idx]
    }
  }

  // 4. SERVICIOS
  if (path === "/api/servicios") {
    const servs = getStorageItem(KEYS.SERVICIOS, defaultServicios)
    if (method === "GET") return { servicios: servs, data: servs, pagination: { total: servs.length, page: 1, limit: 100, totalPages: 1 } }
    if (method === "POST") {
      const nuevo: Servicio = {
        ...body,
        id: servs.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      servs.push(nuevo)
      setStorageItem(KEYS.SERVICIOS, servs)
      return nuevo
    }
  }
  if (path.startsWith("/api/servicios/")) {
    const servs = getStorageItem(KEYS.SERVICIOS, defaultServicios)
    const profs = getStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
    const segments = path.replace("/api/servicios/", "").split("/")
    const id = parseInt(segments[0] || "0")
    const idx = servs.findIndex((s) => s.id === id)

    if (segments[1] === "profesionales") {
      const serviceProfessionals = profs.filter((p) => p.estado === "Activo")
      return {
        profesionales: serviceProfessionals,
        servicio_id: id,
        nombre: servs[idx]?.nombre || "",
      }
    }

    if (method === "PUT") {
      servs[idx] = { ...servs[idx], ...body, updatedAt: new Date().toISOString() }
      setStorageItem(KEYS.SERVICIOS, servs)
      return servs[idx]
    }
    if (method === "GET") {
      return servs[idx] || null
    }
  }

  // 5. PACIENTES
  if (path === "/api/pacientes") {
    const pacs = getStorageItem(KEYS.PACIENTES, defaultPacientes)
    if (method === "GET") {
      const search = query.get("search")?.toLowerCase() || ""
      const filtered = pacs.filter(
        (p) =>
          p.nombre.toLowerCase().includes(search) ||
          p.apellido.toLowerCase().includes(search) ||
          p.numero_documento.includes(search)
      )
      return {
        pacientes: filtered,
        pagination: { total: filtered.length, page: 1, limit: 100, totalPages: 1 },
      }
    }
    if (method === "POST") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      const nuevo: Paciente = {
        ...data,
        id: `pac-${pacs.length + 1}`,
        condicion: "Activo",
        obraSocial: defaultObrasSociales.find((o) => o.id === parseInt(data.obra_social_id || "0")),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      pacs.push(nuevo)
      setStorageItem(KEYS.PACIENTES, pacs)
      return nuevo
    }
  }
  if (path.startsWith("/api/pacientes/")) {
    const pacs = getStorageItem(KEYS.PACIENTES, defaultPacientes)
    const id = path.split("/").pop() || ""

    if (path.includes("/documento/")) {
      const doc = path.split("/").pop() || ""
      const found = pacs.find((p) => p.numero_documento === doc)
      if (!found) throw { response: { status: 404, data: { error: "Paciente no encontrado" } } }
      return found
    }

    const idx = pacs.findIndex((p) => p.id === id)
    if (method === "GET") {
      const patient = pacs[idx]
      if (!patient) throw { response: { status: 404, data: { error: "Paciente no encontrado" } } }
      return patient
    }
    if (method === "PUT") {
      pacs[idx] = { ...pacs[idx], ...body, updatedAt: new Date().toISOString() }
      setStorageItem(KEYS.PACIENTES, pacs)
      return pacs[idx]
    }
    if (method === "DELETE") {
      const filtered = pacs.filter((p) => p.id !== id)
      setStorageItem(KEYS.PACIENTES, filtered)
      return { message: "Paciente eliminado" }
    }
  }

  // 6. TURNOS
  if (path === "/api/turnos") {
    const turnos = getStorageItem(KEYS.TURNOS, generateDefaultTurnos())
    const pacs = getStorageItem(KEYS.PACIENTES, defaultPacientes)
    const profs = getStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
    const servs = getStorageItem(KEYS.SERVICIOS, defaultServicios)

    if (method === "GET") {
      const fechaDesde = query.get("fecha_desde")
      const fechaHasta = query.get("fecha_hasta")
      const profId = query.get("profesional_id")
      const pacId = query.get("paciente_id")

      const desdeStr = fechaDesde || getTodayDateStr(-30)
      const hastaStr = fechaHasta || getTodayDateStr(30)

      // Generamos turnos dinámicos en el rango solicitado para llenar la agenda de forma determinista
      const dynamicTurnos = getDynamicTurnosForRange(desdeStr, hastaStr)
      const userTurnos = getStorageItem<any[]>(KEYS.TURNOS, [])

      // Combinar: si un turno de usuario coincide en fecha, hora_inicio y profesional_id con uno dinámico,
      // usamos el turno de usuario (que contiene el estado actualizado, ej. "Atendido").
      const combined = dynamicTurnos.map((dt) => {
        const updated = userTurnos.find(
          (ut: any) => ut.fecha === dt.fecha && ut.hora_inicio === dt.hora_inicio && ut.profesional_id === dt.profesional_id
        )
        return updated ? { ...(dt as any), ...updated } : dt
      })

      // Agregar los turnos de usuario que no coinciden con ningún turno dinámico (nuevos turnos creados)
      userTurnos.forEach((ut: any) => {
        const isMatch = dynamicTurnos.some(
          (dt) => dt.fecha === ut.fecha && dt.hora_inicio === ut.hora_inicio && dt.profesional_id === ut.profesional_id
        )
        if (!isMatch) {
          combined.push(ut)
        }
      })

      let filtered = combined
      if (profId) filtered = filtered.filter((t) => t.profesional_id === parseInt(profId))
      if (pacId) filtered = filtered.filter((t) => t.paciente_id === pacId)

      return {
        turnos: filtered,
        pagination: { total: filtered.length, page: 1, limit: 5000, totalPages: 1 },
      }
    }
    if (method === "POST") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      const p = pacs.find((x) => x.id === data.paciente_id)
      const pr = profs.find((x) => x.id === parseInt(data.profesional_id || "0"))
      const s = servs.find((x) => x.id === parseInt(data.servicio_id || "0"))

      const nuevo: Turno = {
        ...data,
        id: turnos.length + 101,
        estado: data.estado || "Pendiente",
        paciente: p,
        profesional: pr,
        servicio: s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      turnos.push(nuevo)
      setStorageItem(KEYS.TURNOS, turnos)

      // Registrar movimiento de deuda
      if (nuevo.precio_final) {
        const movs = getStorageItem(KEYS.MOVIMIENTOS, defaultMovimientos)
        movs.push({
          id: movs.length + 1,
          paciente_id: nuevo.paciente_id,
          tipo: "Deuda",
          monto: nuevo.precio_final.toFixed(2),
          descripcion: `Turno agendado - ${s?.nombre || "Tratamiento"}`,
          fecha: nuevo.fecha,
          createdAt: new Date().toISOString(),
        } as any)
        setStorageItem(KEYS.MOVIMIENTOS, movs)
      }

      return nuevo
    }
  }
  if (path.startsWith("/api/turnos/")) {
    const turnos = getStorageItem(KEYS.TURNOS, generateDefaultTurnos())
    const id = parseInt(path.split("/").pop() || "0")
    let idx = turnos.findIndex((t) => t.id === id)

    if (idx === -1) {
      // Buscar en turnos dinámicos en un rango amplio para no perder persistencia
      const startRange = getTodayDateStr(-60)
      const endRange = getTodayDateStr(60)
      const dynamic = getDynamicTurnosForRange(startRange, endRange)
      const found = dynamic.find((t) => t.id === id)
      if (found) {
        turnos.push(found)
        idx = turnos.length - 1
      }
    }

    if (path.endsWith("/confirmar-pago")) {
      const data = typeof body === "string" ? JSON.parse(body) : body
      turnos[idx].pago_confirmado = data.confirmar
      if (data.confirmar) {
        turnos[idx].estado = "Atendido"
        // Registrar ingreso en caja
        const movs = getStorageItem(KEYS.MOVIMIENTOS, defaultMovimientos)
        movs.push({
          id: movs.length + 1,
          paciente_id: turnos[idx].paciente_id,
          tipo: "Ingreso",
          monto: (turnos[idx].precio_final || 5000).toFixed(2),
          forma_pago: "Efectivo",
          descripcion: `Cobro turno - ${turnos[idx].servicio?.nombre}`,
          fecha: getTodayDateStr(),
          createdAt: new Date().toISOString(),
        } as any)
        setStorageItem(KEYS.MOVIMIENTOS, movs)
      }
      setStorageItem(KEYS.TURNOS, turnos)
      return turnos[idx]
    }

    if (method === "PUT") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      turnos[idx] = { ...turnos[idx], ...data, updatedAt: new Date().toISOString() }
      setStorageItem(KEYS.TURNOS, turnos)
      return turnos[idx]
    }
    if (method === "DELETE") {
      const filtered = turnos.filter((t) => t.id !== id)
      setStorageItem(KEYS.TURNOS, filtered)
      return { message: "Turno eliminado" }
    }
  }

  // 7. ODONTOGRAMAS
  if (path === "/api/odontogramas") {
    const odonto = getStorageItem(KEYS.ODONTOGRAMAS, defaultOdontogramas)
    if (method === "GET") {
      const pacId = query.get("paciente_id")
      return odonto.filter((o) => o.paciente_id === pacId)
    }
    if (method === "POST") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      const nuevo: Odontograma = {
        ...data,
        id: odonto.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      odonto.push(nuevo)
      setStorageItem(KEYS.ODONTOGRAMAS, odonto)
      return nuevo
    }
  }
  if (path === "/api/odontogramas/inicializar") {
    // Retorna mapa dental vacío
    const dientes_data: Record<string, any> = {}
    const ids = [
      18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
      48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
    ]
    ids.forEach((id) => {
      dientes_data[id.toString()] = {
        estado: "Sano",
        superficies: { oclusal: "Sano", vestibular: "Sano", lingual: "Sano", mesial: "Sano", distal: "Sano" },
        tratamientos: {},
      }
    })
    return { dientes_data }
  }
  if (path.startsWith("/api/odontogramas/") && path.endsWith("/estadisticas")) {
    return {
      total_dientes: 32,
      sanos: 30,
      con_caries: 1,
      obturados: 0,
      extraidos: 0,
      ausentes: 1,
      otros: 0,
    }
  }

  // 8. HISTORIALES CLINICOS
  if (path === "/api/historiales-clinicos") {
    const hist = getStorageItem(KEYS.HISTORIALES, defaultHistoriales)
    if (method === "GET") {
      const pacId = query.get("paciente_id")
      return hist.filter((h) => h.paciente_id === pacId)
    }
    if (method === "POST") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      const nuevo: HistorialClinico = {
        ...data,
        id: hist.length + 501,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      hist.unshift(nuevo) // Agregar al principio
      setStorageItem(KEYS.HISTORIALES, hist)
      return nuevo
    }
  }

  // 9. CUENTA CORRIENTE (FINANZAS)
  if (path.startsWith("/api/cuenta-corriente/")) {
    const id = path.split("/").pop() || ""
    const movs = getStorageItem(KEYS.MOVIMIENTOS, defaultMovimientos)

    if (id === "deudores") {
      // Retorna reporte de deudores
      const pacs = getStorageItem(KEYS.PACIENTES, defaultPacientes)
      return pacs.map((p) => {
        const patientMovs = movs.filter((m) => m.paciente_id === p.id)
        const ingresos = patientMovs.filter((m) => m.tipo === "Ingreso").reduce((sum, m) => sum + parseFloat(m.monto), 0)
        const deudas = patientMovs.filter((m) => m.tipo === "Deuda").reduce((sum, m) => sum + parseFloat(m.monto), 0)
        return {
          paciente: {
            id: p.id,
            nombre: p.nombre,
            apellido: p.apellido,
            obra_social: p.obraSocial?.nombre || "Particular",
          },
          deudaTotal: deudas - ingresos > 0 ? deudas - ingresos : 0,
          fechaDesde: getTodayDateStr(-30),
        }
      }).filter((d) => d.deudaTotal > 0)
    }

    if (id === "caja") {
      if (method === "GET") {
        const ingresos = movs.filter((m) => m.tipo === "Ingreso").reduce((sum, m) => sum + parseFloat(m.monto), 0)
        const egresos = movs.filter((m) => m.tipo === "Egreso").reduce((sum, m) => sum + parseFloat(m.monto), 0)
        return {
          movimientos: movs,
          balance: ingresos - egresos,
        }
      }
      if (method === "POST") {
        const data = typeof body === "string" ? JSON.parse(body) : body
        const nuevo = {
          ...data,
          id: movs.length + 1,
          monto: parseFloat(data.monto).toFixed(2),
          createdAt: new Date().toISOString(),
        }
        movs.unshift(nuevo)
        setStorageItem(KEYS.MOVIMIENTOS, movs)
        return nuevo
      }
    }

    // Cuenta corriente de un paciente específico
    const patientMovs = movs.filter((m) => m.paciente_id === id)
    const ingresos = patientMovs.filter((m) => m.tipo === "Ingreso").reduce((sum, m) => sum + parseFloat(m.monto), 0)
    const deudas = patientMovs.filter((m) => m.tipo === "Deuda").reduce((sum, m) => sum + parseFloat(m.monto), 0)

    return {
      movimientos: patientMovs,
      resumen: {
        ingresos,
        deudas,
        saldo: deudas - ingresos,
      },
    }
  }

  // 10. LIQUIDACIONES
  if (path === "/api/liquidaciones") {
    const liqs = getStorageItem(KEYS.LIQUIDACIONES, defaultLiquidaciones)
    if (method === "GET") {
      return {
        liquidaciones: liqs,
        data: liqs,
        pagination: { total: liqs.length, page: 1, limit: 100, totalPages: 1 }
      }
    }
    if (method === "POST") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      const profs = getStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
      const prof = profs.find(p => p.id === parseInt(data.profesional_id || "0")) || defaultProfesionales[0]
      const nueva = {
        id: liqs.length + 101,
        profesional_id: parseInt(data.profesional_id || "0"),
        periodo_inicio: data.fecha_desde || getTodayDateStr(-30),
        periodo_fin: data.fecha_hasta || getTodayDateStr(),
        monto_total_servicios: parseFloat(data.monto_total_servicios || "15000"),
        monto_profesional: parseFloat(data.monto_profesional || "7500"),
        cantidad_prestaciones: parseInt(data.cantidad_prestaciones || "1"),
        estado: "Pendiente",
        profesional: prof,
        createdAt: new Date().toISOString(),
      }
      liqs.push(nueva)
      setStorageItem(KEYS.LIQUIDACIONES, liqs)
      return nueva
    }
  }
  if (path.startsWith("/api/liquidaciones/")) {
    const liqs = getStorageItem(KEYS.LIQUIDACIONES, defaultLiquidaciones)
    const idPart = path.split("/")[3] || ""
    const id = parseInt(idPart)
    const idx = liqs.findIndex((l) => l.id === id)

    if (path.endsWith("/anular")) {
      if (idx !== -1) {
        liqs[idx].estado = "Anulada"
        setStorageItem(KEYS.LIQUIDACIONES, liqs)
      }
      return { message: "Liquidación anulada correctamente" }
    }

    if (method === "GET") {
      const found = liqs.find((l) => l.id === id)
      if (!found) throw { response: { status: 404, data: { error: "Liquidación no encontrada" } } }
      return found
    }
    if (method === "DELETE") {
      const filtered = liqs.filter((l) => l.id !== id)
      setStorageItem(KEYS.LIQUIDACIONES, filtered)
      return { message: "Liquidación eliminada" }
    }
  }

  // 11. OBRAS SOCIALES
  if (path === "/api/obras-sociales") {
    return getStorageItem(KEYS.OBRAS_SOCIALES, defaultObrasSociales)
  }

  // 12. SUCURSALES
  if (path === "/api/sucursales") {
    return getStorageItem(KEYS.SUCURSALES, defaultSucursales)
  }

  // 12b. FERIADOS
  if (path === "/api/feriados") {
    const fers = getStorageItem(KEYS.FERIADOS, defaultFeriados)
    if (method === "GET") {
      const year = query.get("year")
      if (year) {
        const yNum = parseInt(year)
        return fers.filter((f: any) => new Date(f.fecha + "T12:00:00").getFullYear() === yNum)
      }
      return fers
    }
    if (method === "POST") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      const nuevo = {
        id: fers.length + 101,
        fecha: data.fecha,
        descripcion: data.descripcion || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      fers.push(nuevo)
      setStorageItem(KEYS.FERIADOS, fers)
      return nuevo
    }
  }
  if (path.startsWith("/api/feriados/")) {
    const fers = getStorageItem(KEYS.FERIADOS, defaultFeriados)
    const id = parseInt(path.split("/").pop() || "0")
    if (method === "DELETE") {
      const filtered = fers.filter((f: any) => f.id !== id)
      setStorageItem(KEYS.FERIADOS, filtered)
      return { message: "Feriado eliminado" }
    }
  }

  // 12c. RECORDATORIOS
  if (path.startsWith("/api/recordatorios")) {
    if (path === "/api/recordatorios/template") {
      if (method === "GET") {
        return { template: "Hola {nombre} {apellido}, te recordamos tu turno el día {fecha} a las {hora_inicio} hs para {servicio} con el profesional {profesional}." }
      }
      if (method === "PUT") {
        const data = typeof body === "string" ? JSON.parse(body) : body
        return { message: "Template guardado", template: data.template }
      }
    }
    if (path === "/api/recordatorios/preview") {
      return { html: "<h3>Vista previa del recordatorio</h3><p>Hola Carlos Sánchez, te recordamos tu turno el día 2026-06-05 a las 09:00 hs para Tratamiento de Ortodoncia con Lucas Díaz.</p>" }
    }
    if (path === "/api/recordatorios/enviar") {
      return { message: "Recordatorio enviado" }
    }
    if (path === "/api/recordatorios/enviar-masivo") {
      return { message: "Envío masivo completado", enviados: 3, errores: 0, total: 3 }
    }
  }

  // 12d. AUSENCIAS
  if (path === "/api/ausencias") {
    const auses = getStorageItem(KEYS.AUSENCIAS, defaultAusencias)
    if (method === "GET") {
      return auses
    }
    if (method === "POST") {
      const data = typeof body === "string" ? JSON.parse(body) : body
      const profs = getStorageItem(KEYS.PROFESIONALES, defaultProfesionales)
      const prof = profs.find((p) => p.id === parseInt(data.profesional_id || "0"))
      const nuevo = {
        ...data,
        id: auses.length + 101,
        profesional: prof ? { id: prof.id, nombre: prof.nombre, apellido: prof.apellido } : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      auses.push(nuevo)
      setStorageItem(KEYS.AUSENCIAS, auses)
      return nuevo
    }
  }
  if (path.startsWith("/api/ausencias/")) {
    const auses = getStorageItem(KEYS.AUSENCIAS, defaultAusencias)
    const id = parseInt(path.split("/").pop() || "0")
    if (method === "DELETE") {
      const filtered = auses.filter((a: any) => a.id !== id)
      setStorageItem(KEYS.AUSENCIAS, filtered)
      return { message: "Ausencia eliminada" }
    }
  }

  // 13. PLANES DE TRATAMIENTO (MOCK PARA DETALLE DE PACIENTE)
  if (path === "/api/planes-tratamiento") {
    return [
      { id: 1, paciente_id: "pac-1", fecha_inicio: getTodayDateStr(-100), descripcion: "Tratamiento Ortodoncia Damon Metálica", estado: "En_Progreso", costo_estimado: 150000, observaciones: "Control mensual de oclusión, alineación y cambio de ligaduras elásticas." },
      { id: 2, paciente_id: "pac-1", fecha_inicio: getTodayDateStr(-60), fecha_fin: getTodayDateStr(-15), descripcion: "Perno y Corona Porcelana Diente 46", estado: "Completado", costo_estimado: 45000, observaciones: "Muñón cementado y corona definitiva colocada con éxito." }
    ]
  }

  // 14. PRESCRIPCIONES (MOCK PARA RECETAS)
  if (path === "/api/prescripciones") {
    return [
      { id: 1, paciente_id: "pac-1", fecha: getTodayDateStr(-15), medicamento: "Amoxicilina 875mg", dosis: "1 comp.", frecuencia: "cada 12 hs", duracion: "7 días", indicaciones: "Tomar con abundante agua. Profilaxis cementado." },
      { id: 2, paciente_id: "pac-1", fecha: getTodayDateStr(-60), medicamento: "Ibuprofeno 600mg", dosis: "1 comp.", frecuencia: "cada 8 hs si presenta dolor", duracion: "3 días", indicaciones: "Tomar preferentemente con alimentos." }
    ]
  }

  // 15. ARCHIVOS (MOCK PARA DIAGNOSTICO)
  if (path === "/api/archivos") {
    return [
      { id: 1, paciente_id: "pac-1", nombre: "Radiografía_Panorámica_Feb26.jpg", tipo: "image/jpeg", ruta: "/assets/mock-xray.png", descripcion: "Radiografía panorámica previa a ortodoncia", createdAt: getTodayDateStr(-100) },
      { id: 2, paciente_id: "pac-1", nombre: "Presupuesto_Tratamiento_Firmado.pdf", tipo: "application/pdf", ruta: "/assets/mock-doc.pdf", descripcion: "Presupuesto ortodoncia Damon e implante firmado", createdAt: getTodayDateStr(-98) }
    ]
  }

  // Fallback genérico para otros métodos
  if (method === "GET") return []
  return { message: "Operación mock exitosa" }
}
