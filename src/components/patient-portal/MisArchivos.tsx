import React, { useState, useEffect } from "react"
import { patientPortalApi } from "../../api/patient-portal"
import { Folder, Download, FileText, Image, File } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export const MisArchivos: React.FC = () => {
  const [archivos, setArchivos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarArchivos = async () => {
      try {
        const perfil = await patientPortalApi.obtenerPerfil()
        setArchivos(perfil.archivos || [])
      } catch (error) {
        console.error("Error al cargar archivos:", error)
      } finally {
        setLoading(false)
      }
    }
    cargarArchivos()
  }, [])

  const formatearFecha = (fecha: string) => {
    try {
      return format(parseISO(fecha), "d 'de' MMM 'de' yyyy", { locale: es })
    } catch {
      return fecha
    }
  }

  const getFileIcon = (tipo: string) => {
    if (tipo?.includes("pdf")) return FileText
    if (tipo?.includes("image")) return Image
    return File
  }

  const getFileColor = (tipo: string) => {
    if (tipo?.includes("pdf")) return "#EF4444"
    if (tipo?.includes("image")) return "#10B981"
    return "#8A93A8"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2458ED]" />
          <span className="text-[#8A93A8] font-medium">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-[#0B2440]">Mis Archivos</h1>

      {archivos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] flex items-center justify-center mx-auto mb-4">
            <Folder size={28} className="text-[#8A93A8]" />
          </div>
          <h3 className="text-lg font-bold text-[#0B2440] mb-2">No hay archivos cargados</h3>
          <p className="text-sm text-[#8A93A8]">
            Los documentos de tus consultas apareceran aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {archivos.map((archivo) => {
            const FileIcon = getFileIcon(archivo.tipo)
            const iconColor = getFileColor(archivo.tipo)

            return (
              <div
                key={archivo.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${iconColor}12` }}
                  >
                    <FileIcon size={22} style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#0B2440] truncate">
                      {archivo.nombre || "Archivo"}
                    </p>
                    <p className="text-xs text-[#8A93A8] mt-0.5">
                      {formatearFecha(archivo.createdAt)}
                    </p>
                  </div>
                </div>

                {archivo.url && (
                  <a
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#5A6178] hover:border-[#2458ED]/30 hover:text-[#2458ED] hover:bg-[#2458ED]/5 transition-all"
                  >
                    <Download size={15} />
                    Descargar
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
