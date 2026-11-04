// Decodificación de archivos de texto: los CSV que exporta Excel en Argentina
// suelen venir en Windows-1252 (Latin-1), no en UTF-8, y las "ñ" y tildes se
// rompen si se leen mal. Los sistemas viejos (DOS, Clipper) usan CP850/CP437.

// Caracteres 0x80–0xFF de CP850 (los de CP437 coinciden en las letras españolas).
const CP850 =
  "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´­±‗¾¶§÷¸°¨·¹³²■ "

export function decodificarCp850(bytes: Uint8Array): string {
  let s = ""
  for (const b of bytes) s += b < 0x80 ? String.fromCharCode(b) : CP850[b - 0x80]
  return s
}

export type Codificacion = "utf-8" | "utf-16le" | "utf-16be" | "windows-1252" | "cp850"

export function detectarCodificacion(bytes: Uint8Array): Codificacion {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8"
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le"
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be"
  // UTF-16 sin BOM: muchos ceros en posiciones impares o pares.
  const muestra = bytes.subarray(0, 2000)
  let ceroImpar = 0, ceroPar = 0
  for (let i = 0; i < muestra.length; i++) if (muestra[i] === 0) (i % 2 ? ceroImpar++ : ceroPar++)
  if (ceroImpar > muestra.length / 4) return "utf-16le"
  if (ceroPar > muestra.length / 4) return "utf-16be"
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    return "utf-8"
  } catch {
    return pareceCp850(bytes) ? "cp850" : "windows-1252"
  }
}

/** Distingue CP850 (DOS) de Windows-1252 por las letras españolas más comunes. */
export function pareceCp850(bytes: Uint8Array): boolean {
  let dos = 0, win = 0
  for (const b of bytes) {
    // CP850: á í ó ú ñ Ñ é ü
    if (b === 0xa0 || b === 0xa1 || b === 0xa2 || b === 0xa3 || b === 0xa4 || b === 0xa5 || b === 0x82 || b === 0x81) dos++
    // 1252: á é í ó ú ñ Ñ ü
    else if (b === 0xe1 || b === 0xe9 || b === 0xed || b === 0xf3 || b === 0xfa || b === 0xf1 || b === 0xd1 || b === 0xfc) win++
  }
  return dos > win
}

export function decodificar(bytes: Uint8Array, codificacion: Codificacion = detectarCodificacion(bytes)): string {
  if (codificacion === "cp850") return decodificarCp850(bytes)
  const texto = new TextDecoder(codificacion).decode(bytes)
  return texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto
}
