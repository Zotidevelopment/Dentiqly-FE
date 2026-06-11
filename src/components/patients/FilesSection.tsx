"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Trash2, Calendar, X, FileText, Download, Upload, File, Eye } from "lucide-react"
import { archivosApi } from "../../api"
import type { Archivo } from "../../types"
import { useToast } from "../../hooks/use-toast"
import { ConfirmationModal } from "../ui/ConfirmationModal"

interface FilesSectionProps {
  pacienteId: string | number
}

export const FilesSection: React.FC<FilesSectionProps> = ({ pacienteId }) => {
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [descripcion, setDescripcion] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<Archivo | null>(null)
  const [confirmAction, setConfirmAction] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchArchivos()
  }, [pacienteId])

  const fetchArchivos = async () => {
    try {
      setLoading(true)
      const data = await archivosApi.listar(pacienteId)
      setArchivos(data)
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowUploadModal(true)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    try {
      setUploading(true)
      await archivosApi.subir(selectedFile, pacienteId, descripcion)
      setShowUploadModal(false)
      setSelectedFile(null)
      setDescripcion("")
      fetchArchivos()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({ variant: "destructive", title: "Error", description: "Error al subir el archivo" })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (id: number) => {
    setConfirmAction({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este archivo?",
      onConfirm: async () => {
        try {
          await archivosApi.eliminar(id)
          fetchArchivos()
        } catch (error) {
          console.error("Error deleting file:", error)
        }
        setConfirmAction(null)
      }
    })
  }

  const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
    return apiUrl
  }

  const handlePreview = (archivo: Archivo) => {
    // If it's a full URL (Cloudinary), use it directly
    const url = archivo.ruta.startsWith('http') 
      ? archivo.ruta 
      : `${getBaseUrl()}${archivo.ruta}${archivo.ruta.includes('?') ? '&' : '?'}inline=true`
    setPreviewUrl(url)
    setPreviewFile(archivo)
  }

  const handleDownload = (archivo: Archivo) => {
    const downloadUrl = archivo.ruta.startsWith('http')
      ? archivo.ruta
      : `${getBaseUrl()}${archivo.ruta}`
    window.open(downloadUrl, "_blank")
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.includes("image")) return "🖼️"
    if (tipo.includes("pdf")) return "📄"
    if (tipo.includes("word") || tipo.includes("document")) return "📝"
    if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "📊"
    return "📎"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando archivos...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Archivos</h3>
        <Button onClick={() => fileInputRef.current?.click()} size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Subir Archivo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        />
      </div>

      {archivos.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <File className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No hay archivos cargados</p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="mt-4 bg-transparent">
            Subir primer archivo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {archivos.map((archivo) => (
            <Card key={archivo.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0">{getFileIcon(archivo.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{archivo.nombre}</p>
                    {archivo.descripcion && <p className="text-xs text-gray-600 mt-1 break-words">{archivo.descripcion}</p>}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{archivo.createdAt ? new Date(archivo.createdAt).toLocaleDateString("es-ES") : "Sin fecha"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 justify-end sm:justify-start mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {(archivo.tipo.includes("image") || archivo.tipo.includes("pdf")) && (
                    <Button variant="outline" size="sm" onClick={() => handlePreview(archivo)} title="Ver" className="flex-1 sm:flex-none justify-center">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(archivo)} title="Descargar" className="flex-1 sm:flex-none justify-center">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(archivo.id)} title="Eliminar" className="flex-1 sm:flex-none justify-center">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full h-full sm:h-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Subir Archivo</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setDescripcion("")
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                  <textarea
                    rows={3}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Agrega una descripción del archivo"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t bg-gray-50 sm:bg-transparent">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                    setDescripcion("")
                  }}
                  disabled={uploading}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading} className="w-full sm:w-auto">
                  {uploading ? "Subiendo..." : "Subir Archivo"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmAction && (
        <ConfirmationModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => { confirmAction.onConfirm(); }}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText="Confirmar"
          variant="destructive"
        />
      )}
      {/* Preview Modal */}
      {previewUrl && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-full sm:h-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center">
              <div className="min-w-0 flex-1 mr-2">
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{previewFile.nombre}</h3>
                <p className="text-xs text-gray-500 truncate">{previewFile.descripcion || "Sin descripción"}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleDownload(previewFile)}>
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Descargar</span>
                </Button>
                <button
                  onClick={() => {
                    setPreviewUrl(null)
                    setPreviewFile(null)
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-gray-100">
              {previewFile.tipo.includes("image") ? (
                <img src={previewUrl} alt={previewFile.nombre} className="max-w-full max-h-[70vh] sm:max-h-[70vh] object-contain" />
              ) : previewFile.tipo.includes("pdf") ? (
                <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full min-h-[50vh] sm:h-[70vh] border-0" title={previewFile.nombre} />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Este tipo de archivo no admite vista previa directa.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
