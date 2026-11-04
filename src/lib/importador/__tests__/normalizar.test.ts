import { describe, expect, it } from "vitest"
import {
  capitalizar, documentoDe, emailsDe, parsearFecha, partirNombreCompleto, sexoDe, telefonosDe, separarPlan, esSinObraSocial,
} from "../normalizar"
import { decodificarCp850 as decodificarCp850Test } from "../texto"

const HOY = new Date("2026-11-04T12:00:00Z")

describe("fechas", () => {
  it("entiende los formatos argentinos y los de otros sistemas", () => {
    expect(parsearFecha("15/03/1980", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("5-3-80", "dmy", HOY).valor).toBe("1980-03-05")
    expect(parsearFecha("1980-03-15", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("1980-03-15 00:00:00", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("1983-03-04T03:00:00.000Z", "dmy", HOY).valor).toBe("1983-03-04")
    expect(parsearFecha("15 de marzo de 1980", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("15-mar-1980", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("March 15, 1980", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("19800315", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("15031980", "dmy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha(29295, "dmy", HOY).valor).toBe("1980-03-15") // serie de Excel
    expect(parsearFecha(new Date(Date.UTC(1980, 2, 15)), "dmy", HOY).valor).toBe("1980-03-15")
  })
  it("respeta el orden de la columna y corrige cuando el día no puede ser mes", () => {
    expect(parsearFecha("03/15/1980", "mdy", HOY).valor).toBe("1980-03-15")
    expect(parsearFecha("03/04/1980", "mdy", HOY).valor).toBe("1980-03-04")
    expect(parsearFecha("03/04/1980", "dmy", HOY).valor).toBe("1980-04-03")
    expect(parsearFecha("25/12/1990", "mdy", HOY).valor).toBe("1990-12-25")
  })
  it("años de dos cifras", () => {
    expect(parsearFecha("01/02/05", "dmy", HOY).valor).toBe("2005-02-01")
    expect(parsearFecha("01/02/45", "dmy", HOY).valor).toBe("1945-02-01")
  })
  it("rechaza fechas imposibles y trata como vacías las de relleno", () => {
    expect(parsearFecha("31/02/1980", "dmy", HOY).problema).toBeTruthy()
    expect(parsearFecha("01/01/2030", "dmy", HOY).problema).toBe("fecha en el futuro")
    expect(parsearFecha("01/01/1900", "dmy", HOY)).toEqual({ valor: null })
    expect(parsearFecha("00/00/0000", "dmy", HOY)).toEqual({ valor: null })
    expect(parsearFecha(1980, "dmy", HOY).problema).toBe("solo tiene el año")
    expect(parsearFecha("hace mucho", "dmy", HOY).problema).toBeTruthy()
  })
})

describe("nombres", () => {
  it("capitaliza solo si viene todo en mayúsculas o minúsculas", () => {
    expect(capitalizar("GARCÍA DE LA FUENTE")).toBe("García de la Fuente")
    expect(capitalizar("o'brien-pérez")).toBe("O'Brien-Pérez")
    expect(capitalizar("McDonald")).toBe("McDonald")
  })
  it("separa nombre y apellido", () => {
    expect(partirNombreCompleto("GARCIA, Juan Carlos", "auto")).toEqual({ apellido: "GARCIA", nombre: "Juan Carlos" })
    expect(partirNombreCompleto("GARCIA PEREZ Juan", "auto")).toEqual({ apellido: "GARCIA PEREZ", nombre: "Juan" })
    expect(partirNombreCompleto("Juan Carlos GARCIA", "auto")).toEqual({ apellido: "GARCIA", nombre: "Juan Carlos" })
    expect(partirNombreCompleto("GARCIA JUAN CARLOS", "auto")).toEqual({ apellido: "GARCIA", nombre: "JUAN CARLOS" })
    expect(partirNombreCompleto("GARCIA PEREZ JUAN CARLOS", "apellido_nombre")).toEqual({ apellido: "GARCIA PEREZ", nombre: "JUAN CARLOS" })
    expect(partirNombreCompleto("DE LA FUENTE MARIA", "apellido_nombre")).toEqual({ apellido: "DE LA FUENTE", nombre: "MARIA" })
    expect(partirNombreCompleto("Juan Carlos García", "nombre_apellido")).toEqual({ nombre: "Juan Carlos", apellido: "García" })
    expect(partirNombreCompleto("Juan de la Fuente", "nombre_apellido")).toEqual({ nombre: "Juan", apellido: "de la Fuente" })
    expect(partirNombreCompleto("BASALLO MONICA EMILCE *** 3309", "apellido_nombre")).toEqual({ apellido: "BASALLO", nombre: "MONICA EMILCE" })
  })
})

describe("documento", () => {
  it("limpia puntos, prefijos y decimales de Excel", () => {
    expect(documentoDe("30.365.357").numero).toBe("30365357")
    expect(documentoDe("DNI 30.365.357").numero).toBe("30365357")
    expect(documentoDe(30365357).numero).toBe("30365357")
    expect(documentoDe("30365357.0").numero).toBe("30365357")
    expect(documentoDe("20.000.000").numero).toBe("20000000")
    expect(documentoDe("5.123.000").numero).toBe("5123000")
  })
  it("saca el DNI del CUIL", () => {
    const d = documentoDe("20-30365357-4")
    expect(d.numero).toBe("30365357")
    expect(d.aviso).toMatch(/CUIL/)
  })
  it("reconoce pasaportes y descarta los de relleno", () => {
    expect(documentoDe("AAB123456")).toMatchObject({ numero: "AAB123456", tipo: "Pasaporte" })
    expect(documentoDe("0").numero).toBeNull()
    expect(documentoDe("00000000").numero).toBeNull()
    expect(documentoDe("s/d").numero).toBeNull()
    expect(documentoDe("123").problema).toBeTruthy()
  })
})

describe("contacto", () => {
  it("separa varios teléfonos y entiende listas JSON", () => {
    expect(telefonosDe("11 4567-8901 / 15 2345 6789")).toEqual({ principal: "11 4567-8901", otros: ["15 2345 6789"] })
    expect(telefonosDe('["1169480410"]').principal).toBe("1169480410")
    expect(telefonosDe(1169480410).principal).toBe("1169480410")
    expect(telefonosDe("1.16948E+09").problema).toMatch(/Excel/)
  })
  it("toma el primer email válido", () => {
    expect(emailsDe("Juan@Mail.com; otro@mail.com")).toEqual({ principal: "juan@mail.com", otros: ["otro@mail.com"] })
    expect(emailsDe('["thiali06@hotmail.com"]').principal).toBe("thiali06@hotmail.com")
    expect(emailsDe("no tiene").principal).toBeNull()
    expect(emailsDe("juan.mail.com").problema).toBeTruthy()
    expect(emailsDe("sin mail")).toEqual({ principal: null, otros: [] })
    expect(emailsDe("pedir en la próxima")).toEqual({ principal: null, otros: [] })
    expect(emailsDe("juan@gmail").problema).toBeTruthy()
  })
})

describe("sexo y obra social", () => {
  it("reconoce el sexo en sus formas comunes", () => {
    expect(sexoDe("F")).toBe("Femenino")
    expect(sexoDe("Varón")).toBe("Masculino")
    expect(sexoDe("MUJER")).toBe("Femenino")
    expect(sexoDe("1")).toBeNull()
  })
  it("separa el plan y reconoce particulares", () => {
    expect(separarPlan("OSDE 210")).toEqual({ nombre: "OSDE", plan: "210" })
    expect(separarPlan("Swiss Medical SMG20")).toEqual({ nombre: "Swiss Medical", plan: "SMG20" })
    expect(separarPlan("IOMA")).toEqual({ nombre: "IOMA" })
    expect(esSinObraSocial("Particular")).toBe(true)
    expect(esSinObraSocial("S/OS")).toBe(true)
    expect(esSinObraSocial("OSDE")).toBe(false)
  })
})

describe("codificación", () => {
  it("decodifica CP850 (sistemas de DOS)", () => {
    expect(decodificarCp850Test(new Uint8Array([0x4e, 0xa4, 0x41, 0x4e, 0x44, 0xa3]))).toBe("NñANDú")
  })
})
