// Campos de Dentiqly a los que se puede llevar cada columna del archivo, y el
// reconocimiento automático: primero por el título de la columna y, si no hay
// título que sirva, por el contenido (mails, DNI, fechas, teléfonos…).
import type { Celda, Tabla } from "./tipos"
import { parsearFecha, partesFecha, sexoDe } from "./normalizar"

export type CampoId =
  | "nombre_completo" | "apellido" | "nombre"
  | "tipo_documento" | "numero_documento"
  | "fecha_nacimiento" | "dia_nacimiento" | "mes_nacimiento" | "anio_nacimiento"
  | "sexo" | "email" | "telefono" | "telefono_2"
  | "direccion" | "localidad" | "provincia" | "codigo_postal"
  | "obra_social" | "plan" | "numero_afiliado"
  | "ocupacion" | "recomendado_por" | "condicion_iva" | "notas"

/** Qué hacer con una columna: llevarla a un campo, guardarla en "Información adicional" o ignorarla. */
export type Destino = CampoId | "extra" | "ignorar"

export interface Campo {
  id: CampoId
  etiqueta: string
  grupo: "Identidad" | "Contacto" | "Domicilio" | "Cobertura" | "Otros"
  ayuda?: string
  /** Se pueden llevar varias columnas a este campo (se juntan). */
  multiple?: boolean
}

export const CAMPOS: Campo[] = [
  { id: "nombre_completo", etiqueta: "Nombre y apellido (juntos)", grupo: "Identidad", ayuda: "Se separa en nombre y apellido" },
  { id: "apellido", etiqueta: "Apellido", grupo: "Identidad" },
  { id: "nombre", etiqueta: "Nombre", grupo: "Identidad" },
  { id: "numero_documento", etiqueta: "DNI / Documento", grupo: "Identidad" },
  { id: "tipo_documento", etiqueta: "Tipo de documento", grupo: "Identidad", ayuda: "DNI, pasaporte o cédula" },
  { id: "fecha_nacimiento", etiqueta: "Fecha de nacimiento", grupo: "Identidad" },
  { id: "dia_nacimiento", etiqueta: "Día de nacimiento", grupo: "Identidad", ayuda: "Si día, mes y año están separados" },
  { id: "mes_nacimiento", etiqueta: "Mes de nacimiento", grupo: "Identidad" },
  { id: "anio_nacimiento", etiqueta: "Año de nacimiento", grupo: "Identidad" },
  { id: "sexo", etiqueta: "Sexo", grupo: "Identidad" },
  { id: "telefono", etiqueta: "Teléfono / celular", grupo: "Contacto" },
  { id: "telefono_2", etiqueta: "Otro teléfono", grupo: "Contacto", ayuda: "Se guarda en Información adicional", multiple: true },
  { id: "email", etiqueta: "Email", grupo: "Contacto" },
  { id: "direccion", etiqueta: "Dirección", grupo: "Domicilio", multiple: true },
  { id: "localidad", etiqueta: "Localidad / barrio", grupo: "Domicilio", ayuda: "Se agrega a la dirección", multiple: true },
  { id: "provincia", etiqueta: "Provincia", grupo: "Domicilio", ayuda: "Se agrega a la dirección" },
  { id: "codigo_postal", etiqueta: "Código postal", grupo: "Domicilio", ayuda: "Se agrega a la dirección" },
  { id: "obra_social", etiqueta: "Obra social / prepaga", grupo: "Cobertura" },
  { id: "plan", etiqueta: "Plan", grupo: "Cobertura", ayuda: "Se guarda en Información adicional" },
  { id: "numero_afiliado", etiqueta: "N.º de afiliado", grupo: "Cobertura" },
  { id: "ocupacion", etiqueta: "Ocupación", grupo: "Otros" },
  { id: "recomendado_por", etiqueta: "Recomendado por", grupo: "Otros" },
  { id: "condicion_iva", etiqueta: "Condición frente al IVA", grupo: "Otros" },
  { id: "notas", etiqueta: "Notas / observaciones", grupo: "Otros", ayuda: "Van a Información adicional", multiple: true },
]

export const campoPorId = new Map(CAMPOS.map((c) => [c.id, c]))

/** "Teléfono Nº" → "telefono n". */
export function normalizarTitulo(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase: dateOfBirth → date Of Birth
    .replace(/_/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[º°ª]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const SINONIMOS: Record<CampoId, string[]> = {
  nombre_completo: ["nombre y apellido", "apellido y nombre", "apellido y nombres", "apellidos y nombres", "nombres y apellidos", "nombre completo", "paciente", "nombre paciente", "nombre del paciente", "ape y nom", "apeynom", "apenom", "apellido nombre", "nombre apellido", "full name", "fullname", "name", "patient name", "patient", "cliente", "nombre cliente", "nombre del cliente", "titular", "razon social", "ayn", "nya", "apellido nombre paciente"],
  apellido: ["apellido", "apellidos", "apellido paciente", "last name", "lastname", "surname", "family name", "ape", "primer apellido", "apellido del paciente"],
  nombre: ["nombre", "nombres", "first name", "firstname", "given name", "nom", "primer nombre", "nombre de pila"],
  tipo_documento: ["tipo documento", "tipo de documento", "tipo doc", "tipodoc", "tipo dni", "document type", "identification type", "tipo identificacion", "td", "id type", "idtype", "identification id type", "tipo de identificacion"],
  numero_documento: ["dni", "documento", "nro documento", "numero documento", "numero de documento", "nro de documento", "n documento", "num documento", "nro doc", "num doc", "doc", "nro dni", "numero dni", "n dni", "dni paciente", "cuil", "cuit", "cuil cuit", "cuit cuil", "identificacion", "identification", "identification number", "document", "document number", "cedula", "ci", "nro cedula", "pasaporte", "ndoc", "nrodoc", "nrodocumento", "documento numero", "nro identificacion", "numero identificacion", "dni cuil"],
  fecha_nacimiento: ["fecha de nacimiento", "fecha nacimiento", "fecha nac", "fec nac", "f nac", "fnac", "fechanac", "fecha de nac", "nacimiento", "nacido", "birthdate", "birth date", "date of birth", "dateofbirth", "dob", "birthday", "cumpleanos", "fecha nacim", "f nacimiento", "fec nacimiento", "fecha de nacimiento paciente", "nac"],
  dia_nacimiento: ["dia de nacimiento", "dia nacimiento", "dia nac", "birth day"],
  mes_nacimiento: ["mes de nacimiento", "mes nacimiento", "mes nac", "birth month"],
  anio_nacimiento: ["ano de nacimiento", "ano nacimiento", "anio de nacimiento", "anio nacimiento", "ano nac", "birth year", "ano de nac"],
  sexo: ["sexo", "genero", "sex", "gender", "sexo biologico", "m f"],
  email: ["email", "e mail", "mail", "correo", "correo electronico", "email paciente", "direccion de correo", "emails", "mails", "e mails", "correo e", "mail paciente"],
  telefono: ["telefono", "tel", "telefonos", "celular", "cel", "movil", "whatsapp", "wsp", "wpp", "phone", "phones", "mobile", "telefono celular", "tel celular", "telefono movil", "nro telefono", "numero de telefono", "numero telefono", "contacto", "tel particular", "telefono particular", "telefono 1", "tel 1", "cel 1", "celular 1", "telefono principal", "tel cel", "phone number", "mobile phone", "cell phone", "cellphone"],
  telefono_2: ["telefono 2", "tel 2", "otro telefono", "telefono alternativo", "telefono fijo", "tel fijo", "telefono secundario", "celular 2", "cel 2", "telefono laboral", "tel laboral", "telefono trabajo", "telefono de contacto", "tel alternativo", "telefono secundario del cliente"],
  direccion: ["direccion", "domicilio", "calle", "address", "dir", "domicilio particular", "direccion particular", "calle y numero", "domicilio real"],
  localidad: ["localidad", "ciudad", "barrio", "partido", "city", "comuna", "municipio", "town", "localidad paciente"],
  provincia: ["provincia", "prov", "state", "region"],
  codigo_postal: ["codigo postal", "cp", "cod postal", "zip", "zip code", "postal code", "c p"],
  obra_social: ["obra social", "os", "o s", "o social", "o soc", "obra s", "os social", "obras sociales", "nombre obra social", "obra soc", "obrasocial", "prepaga", "cobertura", "cobertura medica", "seguro", "insurance", "mutual", "financiador", "cobertura social", "obra social prepaga", "os prepaga", "entidad", "obra social paciente", "os paciente", "obra social nombre", "insurance name", "health insurance", "healthinsurance", "insurance company", "coverage"],
  plan: ["plan", "plan obra social", "plan os", "plan prepaga", "plan cobertura"],
  numero_afiliado: ["afiliado", "nro afiliado", "numero afiliado", "numero de afiliado", "n afiliado", "num afiliado", "nro de afiliado", "credencial", "nro credencial", "carnet", "nro carnet", "nro socio", "numero de socio", "socio", "affiliate number", "member number", "insurance number", "health insurance number", "obra social numero", "os numero", "obra social nro", "numero obra social", "nro obra social", "nafiliado", "nro afil", "afiliado nro", "numero credencial", "insurance number"],
  ocupacion: ["ocupacion", "ocupation", "profesion", "trabajo", "occupation", "actividad", "profesion u oficio"],
  recomendado_por: ["recomendado por", "referido por", "derivado por", "derivacion", "como nos conocio", "como nos conociste", "origen", "referencia", "recomendacion", "referido", "recomendado"],
  condicion_iva: ["condicion iva", "condicion frente al iva", "iva", "cond iva", "situacion iva", "condicion fiscal"],
  notas: ["observaciones", "observacion", "notas", "nota", "comentarios", "comentario", "obs", "antecedentes", "alergias", "informacion adicional", "info adicional", "notes", "comments", "detalle", "datos adicionales", "observaciones generales", "antecedents", "medical history", "allergies", "observations", "info", "informacion", "historia", "historia clinica resumen"],
}

// Columnas técnicas de otros sistemas que no vale la pena guardar.
const TECNICAS = /^(password|contrasena|clave|hash|salt|token|deleted at|deleted|borrado|eliminado|row version|rowversion|version|__v|lock)$/

const CORTOS_SOLO_EXACTO = new Set(["cliente", "paciente", "titular", "socio", "contacto", "origen", "entidad", "seguro", "info", "historia", "nombre", "name", "patient", "os", "o s", "ci", "cp", "c p", "tel", "doc", "dir", "nom", "ape", "td", "nac", "iva", "cel", "prov", "m f", "obs", "name", "zip", "ayn", "nya"])

/** Puntaje de 0 a 100 de qué tan bien un título corresponde a un campo. */
export function puntajeTitulo(titulo: string, campo: CampoId): number {
  const t = normalizarTitulo(titulo)
  if (!t) return 0
  const sinRelleno = t.replace(/\b(del|de|la|el|los|las|paciente|pac|cliente|nro|numero|num|n|no)\b/g, " ").replace(/\s+/g, " ").trim()
  let mejor = 0
  for (const s of SINONIMOS[campo]) {
    if (t === s) return 100
    if (sinRelleno && sinRelleno === s) mejor = Math.max(mejor, 92)
    else if (t.replace(/\s/g, "") === s.replace(/\s/g, "")) mejor = Math.max(mejor, 90)
    else if (!CORTOS_SOLO_EXACTO.has(s) && s.length >= 3 && new RegExp(`(^| )${s.replace(/ /g, " ")}( |$)`).test(t)) {
      // "Obra social - condición" o "Health insurance number" hablan de un atributo, no del campo.
      const resto = ` ${t} `.replace(` ${s} `, " ")
      const atributo = /\b(numero|nro|num|plan|condicion|condition|tipo|type|id|codigo|cod|code|fecha|date|vencimiento|titular|estado|status|alta|baja|creacion)\b/.test(resto)
      mejor = Math.max(mejor, atributo ? 0 : 50 + Math.min(s.length, 30))
    }
  }
  return mejor
}

const OBRAS_CONOCIDAS = /\b(osde|swiss|galeno|medife|omint|sancor|ioma|pami|osecac|ospe|ospedyc|osdepym|union personal|accord|prevencion|italiano|aleman|medicus|federada|avalian|jerarquicos|particular|ospjn|ospacp|osprera|ospim|osplad|dosep|apross|ipross|iosfa|obsba|luis pasteur|cemic|premedic|hominis|bristol|medical|ostel|ospat|ospf|osuthgra|ostep|osmata|osfatlyf|amffa|ospesga|sin obra social|sin os)\b/i

interface Perfil {
  ids: number; booleanos: number; distintos: number; email: number; dni: number; fecha: number; telefono: number; sexo: number; obra: number; palabras: number; numeros: number; vacios: number; muestras: number; multipalabra: number
}

export function perfilColumna(valores: Celda[]): Perfil {
  const llenos = valores.filter((v) => v !== null && String(v).trim() !== "")
  const muestra = llenos.slice(0, 400)
  const n = muestra.length || 1
  const contar = (f: (v: Celda, s: string) => boolean) => muestra.filter((v) => f(v, String(v).trim())).length / n
  return {
    muestras: muestra.length,
    booleanos: contar((v, s) => typeof v === "boolean" || /^(true|false|si|sí|no|yes|verdadero|falso)$/i.test(s)),
    distintos: new Set(muestra.map((v) => String(v).trim().toLowerCase())).size,
    ids: contar((_, s) => /^[0-9a-f]{24}$|^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)),
    vacios: 1 - llenos.length / (valores.length || 1),
    email: contar((_, s) => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/.test(s)),
    dni: contar((v, s) => { const d = typeof v === "number" ? String(Math.trunc(v)) : s.replace(/[.\s-]/g, ""); return /^\d{6,8}$/.test(d) }),
    fecha: contar((v, s) => v instanceof Date || (/[/\-.]/.test(s) && parsearFecha(s, "dmy").valor !== null)),
    telefono: contar((v, s) => { const d = (typeof v === "number" ? String(v) : s).replace(/\D/g, ""); return d.length >= 9 && d.length <= 15 && /^[\d\s()+\-/.]+$/.test(String(v)) }),
    sexo: contar((v) => sexoDe(v, true) !== null),
    obra: contar((_, s) => s.length <= 40 && OBRAS_CONOCIDAS.test(s)),
    palabras: contar((_, s) => /^[\p{L}'´\-. ]+$/u.test(s) && /\p{L}{2,}/u.test(s)),
    multipalabra: contar((_, s) => /^[\p{L}'´\-., ]+$/u.test(s) && s.replace(/,/g, " ").trim().split(/\s+/).length >= 2),
    numeros: contar((v, s) => typeof v === "number" || /^-?\d+([.,]\d+)?$/.test(s)),
  }
}

/** ¿El contenido de la columna puede ser de este campo? Evita, por ejemplo, llevar "Número de cliente" al nombre. */
export function contenidoCompatible(campo: CampoId, p: Perfil): boolean {
  if (p.muestras === 0) return true
  if (p.ids > 0.5) return false
  if (p.booleanos > 0.8) return false
  switch (campo) {
    case "nombre_completo": case "apellido": case "nombre": case "localidad": case "provincia": case "ocupacion": return p.numeros < 0.5
    case "numero_documento": return p.palabras < 0.5 && p.email < 0.2
    case "email": return p.email > 0.3
    case "fecha_nacimiento": return p.fecha > 0.3 || p.numeros > 0.6
    case "telefono": case "telefono_2": return p.palabras < 0.6 && p.email < 0.2
    case "sexo": return p.sexo > 0.5 || p.distintos <= 6
    case "obra_social": return p.numeros < 0.8 && p.email < 0.2
    case "dia_nacimiento": case "mes_nacimiento": case "anio_nacimiento": return p.numeros > 0.5 || campo === "mes_nacimiento"
    default: return true
  }
}

/** Mapeo automático: devuelve un destino por columna. */
export function mapearAutomaticamente(tabla: Tabla): Destino[] {
  const n = tabla.columnas.length
  const destinos: Destino[] = new Array(n).fill("extra")
  const perfiles = tabla.columnas.map((_, i) => perfilColumna(tabla.filas.map((f) => f[i] ?? null)))
  const usados = new Set<CampoId>()

  // 1) Por título: se asignan de mayor a menor puntaje.
  if (tabla.conCabecera) {
    const candidatos: { col: number; campo: CampoId; puntaje: number }[] = []
    tabla.columnas.forEach((titulo, col) => {
      for (const c of CAMPOS) {
        const p = puntajeTitulo(titulo, c.id)
        if (p >= 55 && contenidoCompatible(c.id, perfiles[col])) candidatos.push({ col, campo: c.id, puntaje: p })
      }
    })
    candidatos.sort((a, b) => b.puntaje - a.puntaje || a.col - b.col)
    const colsAsignadas = new Set<number>()
    for (const { col, campo } of candidatos) {
      if (colsAsignadas.has(col)) continue
      let destino: CampoId = campo
      if (usados.has(campo)) {
        if (campo === "telefono") destino = "telefono_2"
        else if (!campoPorId.get(campo)?.multiple) continue
      }
      destinos[col] = destino
      usados.add(destino)
      colsAsignadas.add(col)
    }
  }

  // 2) Por contenido, para las columnas que no se reconocieron por el título.
  const libre = (c: CampoId) => !usados.has(c)
  const asignar = (col: number, c: CampoId) => { destinos[col] = c; usados.add(c) }
  perfiles.forEach((p, col) => {
    if (destinos[col] !== "extra" || p.muestras === 0 || p.ids > 0.5) return
    const titulo = normalizarTitulo(tabla.columnas[col] ?? "")
    if (tabla.conCabecera && titulo && !/^(columna|column|col|campo|field|f)\s*\d*$/.test(titulo) && !/^\d+$/.test(titulo)) {
      // Con un título propio que no reconocimos, solo se adivina si el contenido es inconfundible.
      if (p.email > 0.8 && libre("email")) asignar(col, "email")
      else if (p.obra > 0.6 && libre("obra_social")) asignar(col, "obra_social")
      return
    }
    if (p.email > 0.6 && libre("email")) asignar(col, "email")
    else if (p.fecha > 0.7 && libre("fecha_nacimiento")) asignar(col, "fecha_nacimiento")
    else if (p.sexo > 0.85 && libre("sexo")) asignar(col, "sexo")
    else if (p.obra > 0.4 && libre("obra_social")) asignar(col, "obra_social")
    else if (p.dni > 0.75 && libre("numero_documento")) asignar(col, "numero_documento")
    else if (p.telefono > 0.6) { if (libre("telefono")) asignar(col, "telefono"); else asignar(col, "telefono_2") }
    else if (p.multipalabra > 0.7 && libre("nombre_completo") && libre("apellido") && libre("nombre")) asignar(col, "nombre_completo")
  })

  // 3) "Nombre" sin columna de apellido y con varias palabras = nombre completo.
  const colNombre = destinos.indexOf("nombre")
  if (colNombre >= 0 && !usados.has("apellido") && !usados.has("nombre_completo") && perfiles[colNombre].multipalabra > 0.6) {
    destinos[colNombre] = "nombre_completo"
  }
  // Sin columna de documento: una columna "extra" que parece DNI.
  if (!destinos.includes("numero_documento")) {
    const col = perfiles.findIndex((p, i) => destinos[i] === "extra" && p.dni > 0.85 && !/id|codigo|cod|nro cliente|numero de cliente|historia|hc|ficha/.test(normalizarTitulo(tabla.columnas[i] ?? "")))
    if (col >= 0) destinos[col] = "numero_documento"
  }

  // 4) Columnas vacías o técnicas: se ignoran.
  perfiles.forEach((p, col) => {
    if (destinos[col] !== "extra") return
    if (p.muestras === 0 || TECNICAS.test(normalizarTitulo(tabla.columnas[col] ?? ""))) destinos[col] = "ignorar"
  })
  return destinos
}

/** Detecta el orden de las fechas de una columna (día/mes o mes/día). */
export function detectarOrdenFechas(valores: Celda[]): "dmy" | "mdy" | "ymd" {
  let primeroMayor12 = 0, segundoMayor12 = 0, anioPrimero = 0
  for (const v of valores.slice(0, 2000)) {
    if (v === null || v instanceof Date || typeof v === "number") continue
    const p = partesFecha(String(v))
    if (!p) continue
    if (p[0] > 31) anioPrimero++
    else if (p[0] > 12) primeroMayor12++
    else if (p[1] > 12) segundoMayor12++
  }
  if (anioPrimero > primeroMayor12 + segundoMayor12) return "ymd"
  return segundoMayor12 > primeroMayor12 ? "mdy" : "dmy"
}

/** "Género. 1 = Femenino, 2 = Masculino" → { "1": "Femenino", "2": "Masculino" }. */
export function codigosSexoDelTitulo(titulo: string): Record<string, "Masculino" | "Femenino" | "Otro"> {
  const r: Record<string, "Masculino" | "Femenino" | "Otro"> = {}
  const t = titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  for (const m of t.matchAll(/\b(\w{1,3})\s*[=:]\s*(femenino|masculino|mujer|hombre|varon|otro|f|m)\b/gi)) {
    const v = m[2].toLowerCase()
    r[m[1].toLowerCase()] = /^(f|femenino|mujer)$/.test(v) ? "Femenino" : /^(m|masculino|hombre|varon)$/.test(v) ? "Masculino" : "Otro"
  }
  return r
}
