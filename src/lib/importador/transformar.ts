// Arma los pacientes de Dentiqly a partir de la tabla leída y el mapeo de
// columnas, y marca qué filas tienen errores, avisos o están repetidas.
import type { Celda, Tabla } from "./tipos"
import { campoPorId, codigosSexoDelTitulo, type Destino, detectarOrdenFechas } from "./campos"
import {
  capitalizar, claveObraSocial, claveValor, documentoDe, emailsDe, esSinObraSocial, fechaDePartes, limpiar,
  limpiarNombre, parsearFecha, partirNombreCompleto, separarPlan, sexoDe, telefonosDe, tipoDocumentoDe,
  type OrdenFechas, type OrdenNombre, type Sexo, type TipoDocumento,
} from "./normalizar"

export type ObraSocialElegida =
  | { tipo: "existente"; id: number; nombre: string }
  | { tipo: "nueva"; nombre: string }
  | { tipo: "ninguna" }

export interface PacienteImportado {
  apellido: string
  nombre: string
  tipo_documento: TipoDocumento
  numero_documento: string | null
  fecha_nacimiento: string | null
  sexo: Sexo | null
  email: string | null
  telefono: string | null
  direccion: string | null
  ocupacion: string | null
  recomendado_por: string | null
  numero_afiliado: string | null
  condicion_iva: string | null
  informacion_adicional: string | null
  obra_social: ObraSocialElegida
}

export interface FilaRevisada {
  indice: number
  /** Fila del archivo (para que la clínica la encuentre). */
  fila: number
  paciente: PacienteImportado
  errores: string[]
  avisos: string[]
  /** Índice de la primera fila con el mismo DNI (esta se combina con aquella y no se importa sola). */
  repetidaDe?: number
}

export interface Opciones {
  ordenNombre: OrdenNombre
  corregirMayusculas: boolean
  ordenFechas: OrdenFechas
  /** Qué hacer con los pacientes sin DNI. */
  sinDocumento: "omitir" | "provisorio"
  /** Si falta el nombre o el apellido (ej.: solo dice "MARTA"): omitir o completar con "S/D". */
  sinNombre: "omitir" | "completar"
  /** Guardar las columnas sin campo en "Información adicional". */
  guardarExtras: boolean
  /** Valor crudo (claveValor) → sexo elegido por la clínica. */
  valoresSexo: Record<string, Sexo | null>
  /** Obra social cruda (claveObraSocial) → qué hacer. */
  valoresObraSocial: Record<string, ObraSocialElegida>
}

export interface ObraSocialClinica { id: number; nombre: string }

export const opcionesIniciales = (tabla: Tabla, mapeo: Destino[]): Opciones => {
  const colFecha = mapeo.indexOf("fecha_nacimiento")
  return {
    ordenNombre: "auto",
    corregirMayusculas: true,
    ordenFechas: colFecha >= 0 ? detectarOrdenFechas(tabla.filas.map((f) => f[colFecha] ?? null)) : "dmy",
    sinDocumento: "provisorio",
    sinNombre: "completar",
    guardarExtras: true,
    valoresSexo: mapeo.includes("sexo") ? codigosSexoDelTitulo(tabla.columnas[mapeo.indexOf("sexo")] ?? "") : {},
    valoresObraSocial: {},
  }
}

const MAX = 255
const cortar = (s: string | null, n = MAX) => (s && s.length > n ? s.slice(0, n) : s)

/** Valores distintos de una columna con cuántas veces aparecen (para el mapeo de valores). */
export function valoresDistintos(tabla: Tabla, col: number, clave: (v: Celda) => string = claveValor) {
  const mapa = new Map<string, { clave: string; ejemplo: string; cantidad: number }>()
  for (const f of tabla.filas) {
    const crudo = limpiar(f[col] ?? null)
    if (!crudo) continue
    const k = clave(crudo)
    const e = mapa.get(k)
    if (e) e.cantidad++
    else mapa.set(k, { clave: k, ejemplo: crudo, cantidad: 1 })
  }
  return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad)
}

/** Sugerencia para cada obra social del archivo: vincular con una existente, crearla o "sin obra social". */
export function sugerirObrasSociales(distintas: { clave: string; ejemplo: string }[], existentes: ObraSocialClinica[]): Record<string, ObraSocialElegida> {
  const porClave = new Map(existentes.map((o) => [claveObraSocial(o.nombre), o]))
  const r: Record<string, ObraSocialElegida> = {}
  for (const d of distintas) {
    if (esSinObraSocial(d.ejemplo)) { r[d.clave] = { tipo: "ninguna" }; continue }
    const exacta = porClave.get(d.clave)
    // "OSDE 210" → OSDE, si OSDE existe.
    const sinPlan = porClave.get(claveObraSocial(separarPlan(d.ejemplo).nombre))
    const o = exacta ?? sinPlan
    r[d.clave] = o ? { tipo: "existente", id: o.id, nombre: o.nombre } : { tipo: "nueva", nombre: capitalizarObra(separarPlan(d.ejemplo).nombre) }
  }
  return r
}

/** Las siglas quedan en mayúsculas (OSDE, IOMA); los nombres largos, capitalizados. */
function capitalizarObra(s: string): string {
  const t = s.trim().replace(/\s+/g, " ")
  if (t.length <= 8 && !/\s/.test(t)) return t.toUpperCase()
  return t === t.toUpperCase() || t === t.toLowerCase() ? capitalizar(t).replace(/\b(Os|Osde|Ioma|Pami)\b/g, (m) => m.toUpperCase()) : t
}

export const SIN_DATO = "S/D"

export function validarPaciente(p: PacienteImportado, opciones: Pick<Opciones, "sinDocumento">): string[] {
  const errores: string[] = []
  if (p.apellido.trim().length < 2) errores.push(p.apellido.trim() ? "El apellido es demasiado corto" : "Falta el apellido")
  if (p.nombre.trim().length < 2) errores.push(p.nombre.trim() ? "El nombre es demasiado corto" : "Falta el nombre")
  if (p.apellido.length > 100 || p.nombre.length > 100) errores.push("Nombre o apellido demasiado largo")
  if (!p.numero_documento && opciones.sinDocumento === "omitir") errores.push("Falta el DNI")
  if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errores.push("El email no es válido")
  if (p.fecha_nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(p.fecha_nacimiento)) errores.push("La fecha de nacimiento no es válida")
  return errores
}

export function armarFilas(tabla: Tabla, mapeo: Destino[], opciones: Opciones): FilaRevisada[] {
  const cols = (d: Destino) => mapeo.flatMap((m, i) => (m === d ? [i] : []))
  const col = (d: Destino) => mapeo.indexOf(d)
  const c = {
    completo: col("nombre_completo"), apellido: col("apellido"), nombre: col("nombre"), doc: col("numero_documento"),
    tipoDoc: col("tipo_documento"), fecha: col("fecha_nacimiento"), dia: col("dia_nacimiento"), mes: col("mes_nacimiento"),
    anio: col("anio_nacimiento"), sexo: col("sexo"), email: col("email"), tel: col("telefono"), tel2: cols("telefono_2"),
    dir: cols("direccion"), loc: col("localidad"), prov: col("provincia"), cp: col("codigo_postal"), obra: col("obra_social"),
    plan: col("plan"), afiliado: col("numero_afiliado"), ocupacion: col("ocupacion"), recomendado: col("recomendado_por"),
    iva: col("condicion_iva"), notas: cols("notas"), extras: opciones.guardarExtras ? cols("extra") : [],
  }
  const nombreCampo = (i: number) => tabla.columnas[i] || `Columna ${i + 1}`
  const txt = (fila: Celda[], i: number) => (i >= 0 ? limpiar(fila[i] ?? null) : "")
  const nombrePropio = (s: string) => (opciones.corregirMayusculas ? capitalizar(s) : s)

  const filas: FilaRevisada[] = tabla.filas.map((fila, indice) => {
    const avisos: string[] = []
    const extras: string[] = []
    const notas: string[] = []

    // Nombre y apellido
    let apellido = "", nombre = ""
    if (c.apellido >= 0 || c.nombre >= 0) {
      apellido = limpiarNombre(txt(fila, c.apellido))
      nombre = limpiarNombre(txt(fila, c.nombre))
      // Solo una de las dos columnas y con varias palabras: se separa.
      if (c.completo >= 0 && (!apellido || !nombre)) {
        const partes = partirNombreCompleto(txt(fila, c.completo), opciones.ordenNombre)
        apellido ||= partes.apellido
        nombre ||= partes.nombre
      } else if (!nombre && apellido.includes(" ") && c.nombre < 0) {
        ;({ apellido, nombre } = partirNombreCompleto(apellido, opciones.ordenNombre))
      } else if (!apellido && nombre.includes(" ") && c.apellido < 0) {
        ;({ apellido, nombre } = partirNombreCompleto(nombre, opciones.ordenNombre))
      }
    } else if (c.completo >= 0) {
      ;({ apellido, nombre } = partirNombreCompleto(txt(fila, c.completo), opciones.ordenNombre))
    }
    apellido = nombrePropio(apellido)
    nombre = nombrePropio(nombre)
    // "MARTA" sola: se completa la parte que falta con S/D para no perder al paciente.
    if (opciones.sinNombre === "completar" && (apellido.length >= 2 || nombre.length >= 2)) {
      if (apellido.length < 2) { avisos.push(`Sin apellido: se cargó "${SIN_DATO}"`); if (apellido) extras.push(`Apellido original: ${apellido}`); apellido = SIN_DATO }
      if (nombre.length < 2) { avisos.push(`Sin nombre: se cargó "${SIN_DATO}"`); if (nombre) extras.push(`Nombre original: ${nombre}`); nombre = SIN_DATO }
    }

    // Documento
    const doc = documentoDe(c.doc >= 0 ? (fila[c.doc] ?? null) : null)
    if (doc.aviso) avisos.push(doc.aviso)
    if (doc.problema) { avisos.push(doc.problema); extras.push(`Documento original: ${txt(fila, c.doc)}`) }
    const tipo = tipoDocumentoDe(c.tipoDoc >= 0 ? (fila[c.tipoDoc] ?? null) : null) ?? doc.tipo ?? "DNI"

    // Fecha de nacimiento
    let fecha: { valor: string | null; problema?: string } = { valor: null }
    if (c.fecha >= 0) fecha = parsearFecha(fila[c.fecha] ?? null, opciones.ordenFechas)
    if (!fecha.valor && c.anio >= 0) fecha = fechaDePartes(fila[c.dia] ?? null, fila[c.mes] ?? null, fila[c.anio] ?? null)
    if (fecha.problema) {
      avisos.push(`Fecha de nacimiento: ${fecha.problema}`)
      const original = [c.fecha, c.dia, c.mes, c.anio].filter((i) => i >= 0).map((i) => txt(fila, i)).filter(Boolean).join("/")
      if (original) extras.push(`Fecha de nacimiento original: ${original}`)
    }

    // Sexo (los valores elegidos a mano por la clínica tienen prioridad)
    let sexo: Sexo | null = null
    if (c.sexo >= 0) {
      const crudo = fila[c.sexo] ?? null
      const k = claveValor(crudo)
      sexo = k in opciones.valoresSexo ? opciones.valoresSexo[k] : sexoDe(crudo)
      if (!sexo && k && !(k in opciones.valoresSexo)) avisos.push(`Sexo no reconocido (${txt(fila, c.sexo)})`)
    }

    // Contacto
    const mails = emailsDe(c.email >= 0 ? (fila[c.email] ?? null) : null)
    if (mails.problema) { avisos.push(mails.problema[0].toUpperCase() + mails.problema.slice(1)); extras.push(`Email (no válido): ${txt(fila, c.email)}`) }
    if (mails.otros.length) extras.push(`Otros emails: ${mails.otros.join(", ")}`)
    const tel = telefonosDe(c.tel >= 0 ? (fila[c.tel] ?? null) : null)
    if (tel.problema) { avisos.push(tel.problema[0].toUpperCase() + tel.problema.slice(1)); extras.push(`Teléfono original: ${txt(fila, c.tel)}`) }
    const otrosTel = [...tel.otros]
    let telefono = tel.principal
    for (const i of c.tel2) {
      const t2 = telefonosDe(fila[i] ?? null)
      if (!telefono && t2.principal) telefono = t2.principal
      else if (t2.principal) otrosTel.push(t2.principal)
      otrosTel.push(...t2.otros)
    }
    if (otrosTel.length) extras.push(`Otros teléfonos: ${[...new Set(otrosTel)].join(" / ")}`)

    // Domicilio
    const calle = c.dir.map((i) => txt(fila, i)).filter(Boolean).join(" ")
    const loc = [txt(fila, c.loc), txt(fila, c.prov)].filter(Boolean)
    const cp = txt(fila, c.cp)
    let direccion = [calle, ...loc].filter(Boolean).map((p) => (opciones.corregirMayusculas ? capitalizar(p) : p)).join(", ")
    if (cp) direccion += `${direccion ? " " : ""}(CP ${cp})`
    if (direccion.length > MAX) { extras.push(`Dirección completa: ${direccion}`); direccion = direccion.slice(0, MAX) }

    // Obra social
    let obra: ObraSocialElegida = { tipo: "ninguna" }
    const obraTxt = txt(fila, c.obra)
    if (obraTxt) {
      const k = claveObraSocial(obraTxt)
      obra = opciones.valoresObraSocial[k] ?? (esSinObraSocial(obraTxt) ? { tipo: "ninguna" } : { tipo: "nueva", nombre: capitalizarObra(separarPlan(obraTxt).nombre) })
      const planPegado = separarPlan(obraTxt).plan
      if (planPegado && c.plan < 0) extras.push(`Plan: ${planPegado}`)
    }
    const plan = txt(fila, c.plan)
    if (plan) extras.push(`Plan: ${plan}`)

    // Notas y columnas sin campo
    for (const i of c.notas) { const t = txt(fila, i); if (t) notas.push(c.notas.length > 1 ? `${nombreCampo(i)}: ${t}` : t) }
    for (const i of c.extras) { const t = txt(fila, i); if (t) extras.push(`${nombreCampo(i)}: ${t}`) }
    const info = [notas.join("\n"), extras.length ? `— Datos del sistema anterior —\n${extras.join("\n")}` : ""].filter(Boolean).join("\n\n")

    const paciente: PacienteImportado = {
      apellido: cortar(apellido, 100)!, nombre: cortar(nombre, 100)!,
      tipo_documento: tipo,
      numero_documento: doc.numero,
      fecha_nacimiento: fecha.valor,
      sexo,
      email: mails.principal,
      telefono: telefono ? telefono.slice(0, 50) : null,
      direccion: direccion || null,
      ocupacion: cortar(nombrePropio(txt(fila, c.ocupacion)) || null),
      recomendado_por: cortar(txt(fila, c.recomendado) || null),
      numero_afiliado: cortar(txt(fila, c.afiliado).replace(/\.0+$/, "") || null),
      condicion_iva: cortar(txt(fila, c.iva) || null),
      informacion_adicional: info ? info.slice(0, 20000) : null,
      obra_social: obra,
    }
    if (!paciente.numero_documento && opciones.sinDocumento === "provisorio") avisos.push("Sin DNI: se le asigna uno provisorio para completar después")
    return { indice, fila: tabla.numeroFila[indice] ?? indice + 2, paciente, errores: validarPaciente(paciente, opciones), avisos }
  })

  // Repetidos dentro del archivo (mismo documento): se combinan en la primera aparición.
  const primera = new Map<string, FilaRevisada>()
  for (const f of filas) {
    const d = f.paciente.numero_documento
    if (!d || f.errores.length) continue
    const previa = primera.get(d)
    if (!previa) { primera.set(d, f); continue }
    f.repetidaDe = previa.indice
    combinar(previa.paciente, f.paciente)
    previa.avisos.push(`Combinado con la fila ${f.fila} (mismo DNI)`)
  }
  return filas
}

/** Completa los datos vacíos de "a" con los de "b". */
function combinar(a: PacienteImportado, b: PacienteImportado) {
  const claves: (keyof PacienteImportado)[] = ["fecha_nacimiento", "sexo", "email", "telefono", "direccion", "ocupacion", "recomendado_por", "numero_afiliado", "condicion_iva"]
  for (const k of claves) if (!a[k] && b[k]) (a as unknown as Record<string, unknown>)[k] = b[k]
  if (a.obra_social.tipo === "ninguna" && b.obra_social.tipo !== "ninguna") a.obra_social = b.obra_social
  if (b.informacion_adicional && b.informacion_adicional !== a.informacion_adicional) {
    a.informacion_adicional = [a.informacion_adicional, b.informacion_adicional].filter(Boolean).join("\n\n").slice(0, 20000)
  }
}

export const etiquetaCampo = (d: Destino) => (d === "extra" ? "Guardar en Información adicional" : d === "ignorar" ? "No importar" : campoPorId.get(d)?.etiqueta ?? d)

/** Resumen para mostrar antes de importar. */
export function resumir(filas: FilaRevisada[]) {
  const validas = filas.filter((f) => !f.errores.length && f.repetidaDe === undefined)
  return {
    total: filas.length,
    validas: validas.length,
    conError: filas.filter((f) => f.errores.length).length,
    repetidas: filas.filter((f) => f.repetidaDe !== undefined).length,
    conAvisos: validas.filter((f) => f.avisos.length).length,
    sinDocumento: validas.filter((f) => !f.paciente.numero_documento).length,
    sinFecha: validas.filter((f) => !f.paciente.fecha_nacimiento).length,
    sinSexo: validas.filter((f) => !f.paciente.sexo).length,
    sinContacto: validas.filter((f) => !f.paciente.telefono && !f.paciente.email).length,
    obrasNuevas: [...new Set(validas.flatMap((f) => (f.paciente.obra_social.tipo === "nueva" ? [f.paciente.obra_social.nombre] : [])))],
  }
}
