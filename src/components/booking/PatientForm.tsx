"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "../ui/Input"
import { Select } from "../ui/Select"
import type { CrearPacienteData, ObraSocial } from "../../types"
import { obrasSocialesApi } from "../../api/obras-sociales"
import { pacientesApi } from "../../api"
import { User, Heart, Shield, Phone, Mail, MapPin, Search, CheckCircle2, UserPlus, UserCheck } from "lucide-react"

interface PatientFormProps {
  onPatientData: (data: CrearPacienteData) => void
  loading?: boolean
}

export const PatientForm: React.FC<PatientFormProps> = ({ onPatientData, loading = false }) => {
  const [obrasSociales, setObrasSociales] = useState<ObraSocial[]>([])
  const [formData, setFormData] = useState<CrearPacienteData>({
    apellido: "",
    nombre: "",
    tipo_documento: "DNI",
    numero_documento: "",
    fecha_nacimiento: "",
    sexo: "Masculino",
    telefono: "",
    email: "",
    direccion: "",
    obra_social_id: undefined,
    numero_afiliado: "",
    contacto_emergencia: "",
    telefono_emergencia: "",
    observaciones: "",
    obra_social_nombre_custom: undefined,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CrearPacienteData, string>>>({})
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [patientMode, setPatientMode] = useState<"choice" | "new" | "existing">("choice")
  const [dniSearch, setDniSearch] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<"idle" | "found" | "not_found">("idle")
  const [existingPatientLocked, setExistingPatientLocked] = useState(false)

  useEffect(() => {
    const fetchObrasSociales = async () => {
      try {
        const data = await obrasSocialesApi.listar()
        setObrasSociales(data)
      } catch (error) {
        console.error("Error fetching obras sociales:", error)
      }
    }
    fetchObrasSociales()
    
    // Load cached patient data
    const cached = localStorage.getItem("dentiqly_patient_data")
    if (cached) {
      try {
        const parsedData = JSON.parse(cached)
        setFormData(prev => ({ ...prev, ...parsedData, observaciones: "" }))
        if (parsedData.nombre || parsedData.apellido) {
          setNombreCompleto(`${parsedData.nombre || ''} ${parsedData.apellido || ''}`.trim())
        }
      } catch (e) {
        console.error("Error loading cached patient data:", e)
      }
    }
  }, [])

  // Save to cache whenever formData changes (except observaciones)
  useEffect(() => {
    const dataToCache = { ...formData }
    delete dataToCache.observaciones
    localStorage.setItem("dentiqly_patient_data", JSON.stringify(dataToCache))
  }, [formData])

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CrearPacienteData, string>> = {}
    if (!nombreCompleto.trim()) newErrors.nombre = "Requerido"
    else if (!nombreCompleto.trim().includes(' ')) newErrors.nombre = "Ingrese nombre y apellido"
    if (!formData.numero_documento.trim()) newErrors.numero_documento = "Requerido"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "Requerido"
    if (!formData.telefono?.trim()) newErrors.telefono = "Requerido"
    if (!formData.email?.trim()) newErrors.email = "Requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) newErrors.email = "Email inválido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const parts = nombreCompleto.trim().split(/\s+/)
      const nombre = parts[0]
      const apellido = parts.slice(1).join(' ') || nombre
      onPatientData({ ...formData, nombre, apellido, tipo_documento: 'DNI' })
    }
  }

  const handleChange = (field: keyof CrearPacienteData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleNombreCompletoChange = (value: string) => {
    setNombreCompleto(value)
    const parts = value.trim().split(/\s+/)
    setFormData(prev => ({
      ...prev,
      nombre: parts[0] || '',
      apellido: parts.slice(1).join(' ') || ''
    }))
    if (errors.nombre) setErrors(prev => ({ ...prev, nombre: undefined }))
  }

  const handleDniSearch = async () => {
    if (!dniSearch.trim()) return
    setSearching(true)
    setSearchResult("idle")
    try {
      const patient = await pacientesApi.buscarPorDocumento(dniSearch.trim())
      if (patient) {
        setFormData({
          apellido: patient.apellido || "",
          nombre: patient.nombre || "",
          tipo_documento: "DNI",
          numero_documento: patient.numero_documento || "",
          fecha_nacimiento: patient.fecha_nacimiento || "",
          sexo: patient.sexo || "Masculino",
          telefono: patient.telefono || "",
          email: patient.email || "",
          direccion: patient.direccion || "",
          obra_social_id: patient.obra_social_id,
          numero_afiliado: patient.numero_afiliado || "",
          contacto_emergencia: patient.contacto_emergencia || "",
          telefono_emergencia: patient.telefono_emergencia || "",
          observaciones: "",
          obra_social_nombre_custom: "",
        })
        setNombreCompleto(`${patient.nombre || ''} ${patient.apellido || ''}`.trim())
        setSearchResult("found")
        setExistingPatientLocked(true)
      } else {
        setSearchResult("not_found")
      }
    } catch {
      setSearchResult("not_found")
    } finally {
      setSearching(false)
    }
  }

  const handleObraSocialChange = (value: string) => {
    if (value === "OTRO") {
      setFormData(prev => ({ 
        ...prev, 
        obra_social_id: undefined, 
        obra_social_nombre_custom: "" 
      }))
    } else if (value.startsWith("ID:")) {
      const id = Number(value.replace("ID:", ""))
      setFormData(prev => ({ 
        ...prev, 
        obra_social_id: id, 
        obra_social_nombre_custom: undefined 
      }))
    } else {
      setFormData(prev => ({ 
        ...prev, 
        obra_social_id: undefined, 
        obra_social_nombre_custom: undefined 
      }))
    }
  }

  if (patientMode === "choice") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center mb-2">¿Ya te atendiste con nosotros?</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setPatientMode("existing")}
            className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#2563FF] hover:bg-blue-50/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[#2563FF]/10 transition-colors">
              <UserCheck className="h-6 w-6 text-[#2563FF]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">Ya soy paciente</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Buscar por DNI</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setPatientMode("new")}
            className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#2563FF] hover:bg-blue-50/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[#2563FF]/10 transition-colors">
              <UserPlus className="h-6 w-6 text-[#2563FF]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900 text-sm">Primera vez</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Completar datos</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Búsqueda por DNI para pacientes existentes */}
      {patientMode === "existing" && !existingPatientLocked && (
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
            <Search className="text-[#2563FF]" size={16} />
            Buscar por DNI
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={dniSearch}
              onChange={(e) => { setDniSearch(e.target.value); setSearchResult("idle") }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleDniSearch() } }}
              placeholder="Ingresá tu DNI"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all"
            />
            <button
              type="button"
              onClick={handleDniSearch}
              disabled={searching || !dniSearch.trim()}
              className="px-5 py-2.5 bg-[#2563FF] text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {searching ? "Buscando..." : "Buscar"}
            </button>
          </div>
          {searchResult === "not_found" && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2.5 rounded-xl text-sm">
              <span>No se encontró un paciente con ese DNI.</span>
              <button type="button" onClick={() => { setPatientMode("new"); setDniSearch("") }} className="underline font-semibold ml-1">
                Completar como nuevo
              </button>
            </div>
          )}
          {searchResult === "found" && (
            <p className="text-xs text-gray-500">Si los datos no son correctos, podés modificarlos antes de confirmar.</p>
          )}
        </div>
      )}

      {patientMode === "existing" && existingPatientLocked && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">Paciente encontrado: {nombreCompleto}</p>
            <p className="text-xs text-green-700">DNI {formData.numero_documento}</p>
          </div>
          <button type="button" onClick={() => { setExistingPatientLocked(false); setSearchResult("idle"); setDniSearch("") }} className="text-xs font-bold text-green-700 underline">
            Cambiar
          </button>
        </div>
      )}

      {/* Solo mostrar el formulario completo si es nuevo o ya se encontró al existente */}
      {(patientMode === "new" || existingPatientLocked) && (
        <>
      {/* Sección 1: Información Personal */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
           <User className="text-[#2563FF]" size={16} />
           Información Personal
        </h3>

        <Input
          label="Nombre Completo *"
          value={nombreCompleto}
          onChange={(e) => handleNombreCompletoChange(e.target.value)}
          error={errors.nombre}
          placeholder="Nombre y apellido"
          className="bg-white"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="DNI *"
            value={formData.numero_documento}
            onChange={(e) => handleChange("numero_documento", e.target.value)}
            error={errors.numero_documento}
            placeholder="12345678"
            className="bg-white"
          />
          <Input
            label="Fecha de Nacimiento *"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
            error={errors.fecha_nacimiento}
            className="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Sexo *"
            value={formData.sexo || "Masculino"}
            onChange={(e) => handleChange("sexo", e.target.value)}
            options={[
              { value: "Masculino", label: "Masculino" },
              { value: "Femenino", label: "Femenino" },
              { value: "Otro", label: "Otro" },
            ]}
            className="bg-white"
          />
          <div className="relative sm:col-span-2">
            <Mail className="absolute right-3 top-9 text-gray-400" size={16} />
            <Input
              label="E-mail *"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              placeholder="ejemplo@mail.com"
              className="bg-white pr-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Phone className="absolute right-3 top-9 text-gray-400" size={16} />
            <Input
              label="Teléfono *"
              type="tel"
              value={formData.telefono || ""}
              onChange={(e) => handleChange("telefono", e.target.value)}
              error={errors.telefono}
              placeholder="11 1234 5678"
              className="bg-white pr-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute right-3 top-9 text-gray-400" size={16} />
            <Input
              label="Dirección"
              value={formData.direccion || ""}
              onChange={(e) => handleChange("direccion", e.target.value)}
              placeholder="Calle 123, Ciudad"
              className="bg-white pr-10"
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Cobertura Médica */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
           <Shield className="text-[#2563FF]" size={16} />
           Cobertura Médica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Obra Social"
            value={
              formData.obra_social_id 
                ? `ID:${formData.obra_social_id}` 
                : formData.obra_social_nombre_custom !== undefined
                  ? "OTRO"
                  : ""
            }
            onChange={(e) => handleObraSocialChange(e.target.value)}
            options={[
              { value: "", label: "Seleccione una opción" },
              ...obrasSociales.map((os) => ({ value: `ID:${os.id}`, label: os.nombre })),
              { value: "OTRO", label: "Otra (especificar)" }
            ]}
            className="bg-white"
          />
          
          {formData.obra_social_id ? (
            <Input
              label="Número de Afiliado"
              value={formData.numero_afiliado || ""}
              onChange={(e) => handleChange("numero_afiliado", e.target.value)}
              placeholder="0000000000"
              className="bg-white"
            />
          ) : formData.obra_social_nombre_custom !== undefined && (
            <div className="animate-in fade-in zoom-in duration-300">
              <Input
                label="Especifique Obra Social *"
                value={formData.obra_social_nombre_custom || ""}
                onChange={(e) => handleChange("obra_social_nombre_custom", e.target.value)}
                placeholder="Nombre de su obra social"
                className="bg-white"
              />
            </div>
          )}
        </div>

        {(!formData.obra_social_id && formData.obra_social_nombre_custom !== undefined) && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <Input
              label="Número de Afiliado"
              value={formData.numero_afiliado || ""}
              onChange={(e) => handleChange("numero_afiliado", e.target.value)}
              placeholder="0000000000"
              className="bg-white"
            />
          </div>
        )}
      </div>

      {/* Sección 3: Emergencia y Otros */}
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
           <Heart className="text-red-400" size={16} />
           Emergencia y Otros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Contacto de Emergencia"
            value={formData.contacto_emergencia || ""}
            onChange={(e) => handleChange("contacto_emergencia", e.target.value)}
            placeholder="Nombre del contacto"
            className="bg-white"
          />
          <Input
            label="Teléfono de Emergencia"
            value={formData.telefono_emergencia || ""}
            onChange={(e) => handleChange("telefono_emergencia", e.target.value)}
            placeholder="11 1234 5678"
            className="bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700">Motivo de consulta / Observaciones</label>
          <textarea
            value={formData.observaciones || ""}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            rows={3}
            placeholder="Escribe aquí cualquier detalle relevante..."
            className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 sm:h-14 bg-[#2563FF] text-white font-bold rounded-xl text-sm sm:text-base hover:bg-blue-700 transition-all uppercase tracking-widest disabled:opacity-50"
      >
        {loading ? "Cargando..." : "Confirmar Datos"}
      </button>
        </>
      )}
    </form>
  )
}
