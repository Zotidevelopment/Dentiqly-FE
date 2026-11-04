import { describe, expect, it } from "vitest"
import { leerArchivo, tablaMasProbable, detectarFilaCabecera } from "../leer"
import { mapearAutomaticamente } from "../campos"
import { armarFilas, opcionesIniciales, resumir, sugerirObrasSociales, valoresDistintos } from "../transformar"
import { claveObraSocial } from "../normalizar"
import { parsearSql } from "../sql"

const archivo = (contenido: BlobPart | BlobPart[], nombre: string) => new File(Array.isArray(contenido) ? contenido : [contenido], nombre)

/** ZIP sin compresión (método 0): alcanza para armar un .xlsx de prueba. */
function zip(archivos: Record<string, string>): Uint8Array {
  const enc = new TextEncoder()
  const locales: Uint8Array[] = []
  const centrales: Uint8Array[] = []
  let offset = 0
  for (const [nombre, contenido] of Object.entries(archivos)) {
    const n = enc.encode(nombre), d = enc.encode(contenido)
    const local = new Uint8Array(30 + n.length + d.length)
    const lv = new DataView(local.buffer)
    lv.setUint32(0, 0x04034b50, true); lv.setUint32(18, d.length, true); lv.setUint32(22, d.length, true); lv.setUint16(26, n.length, true)
    local.set(n, 30); local.set(d, 30 + n.length)
    const central = new Uint8Array(46 + n.length)
    const cv = new DataView(central.buffer)
    cv.setUint32(0, 0x02014b50, true); cv.setUint32(20, d.length, true); cv.setUint32(24, d.length, true); cv.setUint16(28, n.length, true); cv.setUint32(42, offset, true)
    central.set(n, 46)
    locales.push(local); centrales.push(central); offset += local.length
  }
  const tamCentral = centrales.reduce((a, c) => a + c.length, 0)
  const fin = new Uint8Array(22)
  const fv = new DataView(fin.buffer)
  fv.setUint32(0, 0x06054b50, true); fv.setUint16(8, centrales.length, true); fv.setUint16(10, centrales.length, true); fv.setUint32(12, tamCentral, true); fv.setUint32(16, offset, true)
  const total = new Uint8Array(offset + tamCentral + 22)
  let p = 0
  for (const b of [...locales, ...centrales, fin]) { total.set(b, p); p += b.length }
  return total
}

const XLSX = {
  "xl/workbook.xml": `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Pacientes" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  "xl/_rels/workbook.xml.rels": `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>`,
  "xl/sharedStrings.xml": `<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><si><t>Listado de pacientes 2024</t></si><si><t>Apellido y Nombre</t></si><si><t>D.N.I.</t></si><si><t>Fecha Nac.</t></si><si><t>O. Social</t></si><si><t>Cel.</t></si><si><t>GARCIA, María José</t></si><si><t>OSDE 210</t></si><si><t>11 4567-8901</t></si><si><t>PEREZ JUAN</t></si><si><t>Particular</t></si><si><t>Observaciones</t></si><si><r><t>Alérgica a la </t></r><r><t>penicilina</t></r></si></sst>`,
  "xl/styles.xml": `<?xml version="1.0"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts><cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="164"/></cellXfs></styleSheet>`,
  "xl/worksheets/sheet1.xml": `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
    <row r="1"><c r="A1" t="s"><v>0</v></c></row>
    <row r="3"><c r="A3" t="s"><v>1</v></c><c r="B3" t="s"><v>2</v></c><c r="C3" t="s"><v>3</v></c><c r="D3" t="s"><v>4</v></c><c r="E3" t="s"><v>5</v></c><c r="F3" t="s"><v>11</v></c></row>
    <row r="4"><c r="A4" t="s"><v>6</v></c><c r="B4"><v>30365357</v></c><c r="C4" s="1"><v>29295</v></c><c r="D4" t="s"><v>7</v></c><c r="E4" t="s"><v>8</v></c><c r="F4" t="s"><v>12</v></c></row>
    <row r="5"><c r="A5" t="s"><v>9</v></c><c r="B5" t="str"><v>28.123.456</v></c><c r="D5" t="s"><v>10</v></c><c r="E5"><v>1169480410</v></c></row>
  </sheetData></worksheet>`,
}

describe("Excel (.xlsx)", () => {
  it("lee la hoja, salta el título y reconoce las columnas", async () => {
    const r = await leerArchivo(archivo(zip(XLSX) as BlobPart, "pacientes.xlsx"))
    expect(r.formato).toBe("Excel")
    const t = r.tablas[0]
    expect(t.nombre).toBe("Pacientes")
    expect(t.columnas).toEqual(["Apellido y Nombre", "D.N.I.", "Fecha Nac.", "O. Social", "Cel.", "Observaciones"])
    expect(t.filas).toHaveLength(2)
    expect(t.numeroFila).toEqual([4, 5])
    expect(t.filas[0][2]).toBeInstanceOf(Date)
    const mapeo = mapearAutomaticamente(t)
    expect(mapeo).toEqual(["nombre_completo", "numero_documento", "fecha_nacimiento", "obra_social", "telefono", "notas"])

    const opciones = opcionesIniciales(t, mapeo)
    opciones.valoresObraSocial = sugerirObrasSociales(valoresDistintos(t, 3, (v) => claveObraSocial(String(v))), [{ id: 7, nombre: "OSDE" }])
    const filas = armarFilas(t, mapeo, opciones)
    expect(filas[0].paciente).toMatchObject({
      apellido: "Garcia", nombre: "María José", numero_documento: "30365357", fecha_nacimiento: "1980-03-15",
      telefono: "11 4567-8901", obra_social: { tipo: "existente", id: 7 },
    })
    expect(filas[0].paciente.informacion_adicional).toContain("Alérgica a la penicilina")
    expect(filas[0].paciente.informacion_adicional).toContain("Plan: 210")
    expect(filas[1].paciente).toMatchObject({ apellido: "Perez", nombre: "Juan", numero_documento: "28123456", telefono: "1169480410", obra_social: { tipo: "ninguna" }, fecha_nacimiento: null })
    expect(resumir(filas)).toMatchObject({ total: 2, validas: 2, conError: 0, sinFecha: 1 })
  })
})

describe("CSV", () => {
  it("Windows-1252 con punto y coma, como lo guarda Excel en español", async () => {
    const texto = "Apellido;Nombre;DNI;Sexo;Email\r\nNUÑEZ;José;12.345.678;M;jose@mail.com\r\nPeña;Inés;;F;\r\n"
    const bytes = Uint8Array.from(texto, (c) => c.charCodeAt(0)) // latin1 = 1252 para estos caracteres
    const r = await leerArchivo(archivo(bytes as BlobPart, "pacientes.csv"))
    expect(r.formato).toMatch(/punto y coma/)
    const t = r.tablas[0]
    expect(t.filas[0][0]).toBe("NUÑEZ")
    expect(t.filas[1][1]).toBe("Inés")
    const mapeo = mapearAutomaticamente(t)
    expect(mapeo).toEqual(["apellido", "nombre", "numero_documento", "sexo", "email"])
    const filas = armarFilas(t, mapeo, opcionesIniciales(t, mapeo))
    expect(filas[0].paciente).toMatchObject({ apellido: "Nuñez", nombre: "José", sexo: "Masculino", numero_documento: "12345678" })
    // Por defecto, al que no tiene DNI se le asigna uno provisorio (no se pierde el paciente).
    expect(filas[1].errores).toEqual([])
    expect(filas[1].avisos.join()).toMatch(/provisorio/)
    const omitir = armarFilas(t, mapeo, { ...opcionesIniciales(t, mapeo), sinDocumento: "omitir" })
    expect(omitir[1].errores).toContain("Falta el DNI")
  })

  it("comillas, saltos de línea dentro de una celda y filas repetidas", async () => {
    const texto = 'Nombre completo,Documento,Telefono\n"Lopez, Ana","20111222",1155556666\n"Lopez, Ana",20.111.222,"Casa: 4444-5555\nCel: 15-6666-7777"\n'
    const t = (await leerArchivo(archivo(texto, "x.csv"))).tablas[0]
    expect(t.filas[1][2]).toContain("\n")
    const mapeo = mapearAutomaticamente(t)
    const filas = armarFilas(t, mapeo, opcionesIniciales(t, mapeo))
    expect(filas[1].repetidaDe).toBe(0)
    expect(resumir(filas)).toMatchObject({ validas: 1, repetidas: 1 })
  })

  it("sin fila de títulos: reconoce las columnas por el contenido", async () => {
    const texto = "GOMEZ CARLOS,25444333,15/05/1975,carlos@gmail.com,M\nDIAZ LAURA,30111222,02/11/1988,laura@hotmail.com,F\nRUIZ PEDRO,27333444,30/01/1970,pedro@yahoo.com,M\n"
    const t = (await leerArchivo(archivo(texto, "x.txt"))).tablas[0]
    expect(t.conCabecera).toBe(false)
    expect(t.filas).toHaveLength(3)
    expect(mapearAutomaticamente(t)).toEqual(["nombre_completo", "numero_documento", "fecha_nacimiento", "email", "sexo"])
  })
})

describe("SQL", () => {
  it("volcado de MySQL con CREATE TABLE e INSERT de varias filas", async () => {
    const sql = `-- MySQL dump
/*!40101 SET NAMES utf8 */;
CREATE TABLE \`turnos\` (\`id\` int NOT NULL, \`fecha\` date, PRIMARY KEY (\`id\`));
CREATE TABLE \`pacientes\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`apellido\` varchar(100) DEFAULT NULL,
  \`nombres\` varchar(100) DEFAULT NULL,
  \`nro_doc\` varchar(20) DEFAULT NULL,
  \`fecha_nac\` date DEFAULT NULL,
  \`obs\` text,
  PRIMARY KEY (\`id\`),
  KEY \`idx_doc\` (\`nro_doc\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO \`turnos\` VALUES (1,'2024-01-01');
INSERT INTO \`pacientes\` VALUES (1,'O\\'Brien','Juan','30111222','1980-03-15','Le duele (mucho), dice: \\"ay\\"'),(2,'Pérez','Ana María','28333444',NULL,NULL);
`
    const r = await leerArchivo(archivo(sql, "backup.sql"))
    expect(r.formato).toBe("SQL")
    const i = tablaMasProbable(r.tablas)
    const t = r.tablas[i]
    expect(t.nombre).toBe("pacientes")
    expect(t.columnas).toEqual(["id", "apellido", "nombres", "nro_doc", "fecha_nac", "obs"])
    expect(t.filas[0]).toEqual([1, "O'Brien", "Juan", "30111222", "1980-03-15", 'Le duele (mucho), dice: "ay"'])
    expect(t.filas[1][4]).toBeNull()
    expect(mapearAutomaticamente(t)).toEqual(["extra", "apellido", "nombre", "numero_documento", "fecha_nacimiento", "notas"])
  })

  it("pg_dump con COPY … FROM stdin", () => {
    const sql = `COPY public.patients (id, first_name, last_name, document_number, birth_date, email) FROM stdin;\n1\tAna\tLópez\t30111222\t1980-01-02\t\\N\n2\tLuis\tSosa\t29111333\t\\N\tluis@x.com\n\\.\n`
    const [t] = parsearSql(sql)
    expect(t.nombre).toBe("patients")
    expect(t.filas).toEqual([["1", "Ana", "López", "30111222", "1980-01-02", null], ["2", "Luis", "Sosa", "29111333", null, "luis@x.com"]])
  })

  it("script de SQL Server (SSMS) sin INTO, con N'' y CAST", () => {
    const sql = `SET IDENTITY_INSERT [dbo].[Pacientes] ON\nGO\nINSERT [dbo].[Pacientes] ([Id], [Nombre], [Apellido], [FechaNacimiento]) VALUES (1, N'María', N'Fernández', CAST(N'1975-06-30' AS Date))\nGO\n`
    const [t] = parsearSql(sql)
    expect(t.nombre).toBe("Pacientes")
    expect(t.columnas).toEqual(["Id", "Nombre", "Apellido", "FechaNacimiento"])
    expect(t.filas[0]).toEqual([1, "María", "Fernández", "1975-06-30"])
  })
})

describe("dBase (.dbf)", () => {
  it("lee un .dbf de un sistema viejo en CP850", async () => {
    const campos = [["APENOM", "C", 20], ["DNI", "N", 9], ["FNAC", "D", 8]] as const
    const largoRegistro = 1 + campos.reduce((a, c) => a + c[2], 0)
    const largoCabecera = 32 + campos.length * 32 + 1
    const registros = [["NU\xA5EZ JOSE", "12345678", "19800315"], ["GOMEZ ANA", "", "        "]]
    const b = new Uint8Array(largoCabecera + registros.length * largoRegistro + 1)
    const v = new DataView(b.buffer)
    b[0] = 0x03; b[1] = 124; b[2] = 1; b[3] = 15; v.setUint32(4, registros.length, true); v.setUint16(8, largoCabecera, true); v.setUint16(10, largoRegistro, true); b[29] = 0x02
    campos.forEach(([n, tipo, largo], i) => { const p = 32 + i * 32; for (let k = 0; k < n.length; k++) b[p + k] = n.charCodeAt(k); b[p + 11] = tipo.charCodeAt(0); b[p + 16] = largo })
    b[largoCabecera - 1] = 0x0d
    registros.forEach((r, i) => {
      let p = largoCabecera + i * largoRegistro
      b[p++] = 0x20
      r.forEach((valor, k) => { const largo = campos[k][2]; const s = campos[k][1] === "N" ? valor.padStart(largo) : valor.padEnd(largo); for (let j = 0; j < largo; j++) b[p + j] = s.charCodeAt(j); p += largo })
    })
    b[b.length - 1] = 0x1a
    const r = await leerArchivo(archivo(b as BlobPart, "PACIENTE.DBF"))
    const t = r.tablas[0]
    expect(t.columnas).toEqual(["APENOM", "DNI", "FNAC"])
    expect(t.filas[0][0]).toBe("NUÑEZ JOSE")
    expect(t.filas[0][1]).toBe(12345678)
    expect((t.filas[0][2] as Date).toISOString().slice(0, 10)).toBe("1980-03-15")
    expect(t.filas[1][1]).toBeNull()
    expect(mapearAutomaticamente(t)).toEqual(["nombre_completo", "numero_documento", "fecha_nacimiento"])
  })
})

describe("JSON", () => {
  it("export de MongoDB con fechas y objetos anidados", async () => {
    const json = JSON.stringify({ data: { patients: [
      { _id: { $oid: "61ddcd87" }, name: "RAMIREZ KARINA", dateOfBirth: { $date: "1983-03-04T03:00:00.000Z" }, emails: ["thiali06@hotmail.com"], identification: { number: "30365357" } },
      { _id: { $oid: "61ddcd88" }, name: "VIDAL ALEJANDRO", emails: [], identification: { number: "22346165" } },
    ] } })
    const r = await leerArchivo(archivo(json, "export.json"))
    const t = r.tablas[0]
    expect(t.nombre).toBe("data.patients")
    expect(t.columnas).toEqual(["_id", "name", "dateOfBirth", "emails", "identification.number"])
    const mapeo = mapearAutomaticamente(t)
    expect(mapeo.slice(1)).toEqual(["nombre_completo", "fecha_nacimiento", "email", "numero_documento"])
    const filas = armarFilas(t, mapeo, opcionesIniciales(t, mapeo))
    expect(filas[0].paciente).toMatchObject({ apellido: "Ramirez", nombre: "Karina", fecha_nacimiento: "1983-03-04", email: "thiali06@hotmail.com" })
  })
})

describe("casos de sistemas reales", () => {
  it("lee los códigos de sexo del título y no confunde el número de cliente con el nombre", async () => {
    const texto = "Nombres;Apellidos;Número de cliente;Género. 1 = Femenino, 2 = Masculino\nAna;Gómez;1001;1\nLuis;Paz;1002;2\nMARTA;;1003;1\n"
    const t = (await leerArchivo(archivo(texto, "clientes.csv"))).tablas[0]
    const mapeo = mapearAutomaticamente(t)
    expect(mapeo).toEqual(["nombre", "apellido", "extra", "sexo"])
    const filas = armarFilas(t, mapeo, opcionesIniciales(t, mapeo))
    expect(filas.map((f) => f.paciente.sexo)).toEqual(["Femenino", "Masculino", "Femenino"])
    expect(filas[2].paciente).toMatchObject({ nombre: "Marta", apellido: "S/D" })
    expect(filas[0].paciente.informacion_adicional).toContain("Número de cliente: 1001")
  })

  it("las listas vacías de Benty no son errores y los IDs de Mongo no se toman como obra social", async () => {
    const texto = 'name,emails,phones,healthInsurance,identification.number\nRAMIREZ KARINA,[],"[""1169480410""]",5eb4a13770fff223dbb2b5a0,30365357\nVIDAL ALE,"[""a@b.com""]",[],5ebf0ed277498359fbca1677,22346165\n'
    const t = (await leerArchivo(archivo(texto, "pacientes.csv"))).tablas[0]
    const mapeo = mapearAutomaticamente(t)
    expect(mapeo).toEqual(["nombre_completo", "email", "telefono", "extra", "numero_documento"])
    const filas = armarFilas(t, mapeo, opcionesIniciales(t, mapeo))
    expect(filas[0].avisos).toEqual([])
    expect(filas[0].paciente.telefono).toBe("1169480410")
    expect(filas[1].paciente.email).toBe("a@b.com")
  })
})

describe("otros formatos", () => {
  it("un “.xls” que en realidad es una tabla HTML", async () => {
    const html = `<html><body><table><tr><th>Paciente</th><th>DNI</th></tr><tr><td>Sosa Luis</td><td>29.111.333</td></tr></table></body></html>`
    const r = await leerArchivo(archivo(html, "reporte.xls"))
    expect(r.formato).toBe("Tabla HTML")
    expect(r.tablas[0].filas).toEqual([["Sosa Luis", "29.111.333"]])
  })

  it("explica qué hacer con un .xls binario o un PDF", async () => {
    await expect(leerArchivo(archivo(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0, 0, 0]) as BlobPart, "viejo.xls"))).rejects.toThrow(/Excel antiguo/)
    await expect(leerArchivo(archivo("%PDF-1.4 ...", "lista.pdf"))).rejects.toThrow(/PDF/)
  })

  it("detecta la fila de títulos aunque haya filas de encabezado arriba", () => {
    expect(detectarFilaCabecera([["Consultorio Dr. X"], [null], ["Nombre", "Apellido", "Teléfono"], ["Ana", "Gómez", "1144445555"]])).toBe(2)
  })
})
