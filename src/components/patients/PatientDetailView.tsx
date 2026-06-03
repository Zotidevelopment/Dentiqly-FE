"use client"

import type React from "react"
import { useState } from "react"
import {
  FileText,
  ChevronLeft,
  Camera,
  Smile,
} from "lucide-react"
import { Button } from "../ui/Button"
import type { Paciente } from "../../types"
import { ClinicalHistorySection } from "./ClinicalHistorySection"
import { OdontogramSection } from "./OdontogramSection"
import { PrescriptionsSection } from "./PrescriptionsSection"
import { TreatmentPlansSection } from "./TreatmentPlansSection"
import { FilesSection } from "./FilesSection"
import { CuentaCorrienteSection } from "./CuentaCorrienteSection"
import { RemindersSection } from "./RemindersSection"
import { TurnosSection } from "./TurnosSection"

interface PatientDetailViewProps {
  patient: Paciente
  onBack: () => void
  onEdit: (patient: Paciente) => void
  onBookTurno?: () => void
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>, patientId: string) => void
  uploadingPhoto: boolean
  getPhotoUrl: (patient: Paciente) => string | null
}

type TabType = "informacion" | "historia" | "odontograma" | "prescripciones" | "tratamientos" | "archivos" | "cuenta_corriente" | "recordatorios" | "turnos"

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onBack,
  onEdit,
  onBookTurno,
  onPhotoUpload,
  uploadingPhoto,
  getPhotoUrl,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("informacion")

  const tabs = [
    { id: "informacion" as TabType, label: "Información" },
    { id: "historia" as TabType, label: "Historia Clínica" },
    { id: "odontograma" as TabType, label: "Odontograma" },
    { id: "prescripciones" as TabType, label: "Prescripciones" },
    { id: "tratamientos" as TabType, label: "Tratamientos" },
    { id: "archivos" as TabType, label: "Archivos" },
    { id: "cuenta_corriente" as TabType, label: "Cuenta Corriente" },
    { id: "recordatorios" as TabType, label: "Recordatorios" },
    { id: "turnos" as TabType, label: "Turnos" },
  ]

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Helper para extraer un color a partir del nombre del paciente para avatares vacíos
  const getAvatarInitials = (name: string, lastName: string) => {
    return `${name?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-3rem)] -m-3 lg:-m-6 p-6 lg:p-10">
      {/* Breadcrumbs + Back */}
      <div className="flex items-center gap-2 text-[13px] font-medium mb-6">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#E8E0D6] text-[#8A93A8] hover:bg-[#F5F0EA] hover:text-[#0B1023] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span
          className="text-[#8A93A8] hover:text-[#4B5568] cursor-pointer transition-colors"
          onClick={onBack}
        >
          Pacientes
        </span>
        <span className="text-[#E8E0D6]">/</span>
        <span className="text-[#0B1023] font-semibold">Detalle</span>
      </div>

      {/* Profile Header Block */}
      <div className="bg-white rounded-2xl border border-[#E8E0D6] p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {getPhotoUrl(patient) ? (
                <img
                  src={getPhotoUrl(patient)!}
                  alt={`${patient.nombre} ${patient.apellido}`}
                  className="h-[72px] w-[72px] rounded-2xl object-cover border border-[#E8E0D6]"
                />
              ) : (
                <div className="h-[72px] w-[72px] rounded-2xl bg-gradient-to-br from-[#2563FF] to-[#7C3AED] flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {getAvatarInitials(patient.nombre, patient.apellido)}
                  </span>
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                <Camera className="h-5 w-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPhotoUpload(e, patient.id)}
                  disabled={uploadingPhoto}
                />
              </label>
              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                  <div className="h-5 w-5 border-2 border-[#2563FF] border-t-transparent animate-spin rounded-full" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-xl font-semibold text-[#0B1023] tracking-[-0.3px] mb-1">
                {patient.nombre} {patient.apellido}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[12px] text-[#8A93A8]">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="max-w-[200px] truncate">
                    {patient.informacion_adicional || "Sin notas"}
                  </span>
                </div>
                <button
                  onClick={() => onEdit(patient)}
                  className="text-[12px] font-semibold text-[#2563FF] hover:text-[#1E40AF] transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onBookTurno}
              className="bg-dental-secondary hover:opacity-90 text-[#0B1023] font-bold rounded-xl px-5 py-2.5 h-auto text-[13px] shadow-sm transition-all"
            >
              Agendar Turno
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="bg-white rounded-2xl border border-[#E8E0D6] px-4 mb-6 overflow-x-auto shadow-[0_1px_3px_rgba(0,0,0,0.03)] sticky top-0 z-20">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-[13px] font-medium whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? "border-[#2563FF] text-[#2563FF]"
                    : "border-transparent text-[#8A93A8] hover:text-[#4B5568] hover:border-[#E8E0D6]"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === "informacion" && (
          <div className="max-w-4xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E8E0D6] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <h3 className="text-[13px] font-semibold text-[#0B1023] mb-4 pb-3 border-b border-[#E8E0D6]/50">Información Personal</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Documento</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.tipo_documento} {patient.numero_documento}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Nacimiento</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">
                      {patient.fecha_nacimiento ? new Date(patient.fecha_nacimiento).toLocaleDateString("es-ES") : "-"}
                      <span className="text-[#8A93A8] ml-1 font-normal">({calculateAge(patient.fecha_nacimiento)} años)</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Sexo</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.sexo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Ocupación</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.ocupacion || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Recomendado por</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.recomendado_por || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Condición IVA</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.condicion_iva || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E0D6] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <h3 className="text-[13px] font-semibold text-[#0B1023] mb-4 pb-3 border-b border-[#E8E0D6]/50">Contacto y Cobertura</h3>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Teléfono</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.telefono || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Email</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.email || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Dirección</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.direccion || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Obra Social</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">
                      {patient.obra_social_nombre_custom || patient.obraSocial?.nombre || "Particular"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Afiliado Nº</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.numero_afiliado || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Contacto Emerg.</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.contacto_emergencia || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Tel. Emergencia</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">{patient.telefono_emergencia || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#8A93A8]">Facturación</span>
                    <span className="text-[13px] font-medium text-[#0B1023]">Factura {patient.tipo_facturacion} {patient.numero_facturacion ? `(${patient.numero_facturacion})` : ""}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="animate-in fade-in duration-300">
          {activeTab === "historia" && <ClinicalHistorySection pacienteId={patient.id} />}
          {activeTab === "odontograma" && (
            <div className="w-full animate-in zoom-in-95 duration-300">
              <OdontogramSection pacienteId={patient.id} />
            </div>
          )}
          {activeTab === "prescripciones" && <PrescriptionsSection pacienteId={patient.id} />}
          {activeTab === "tratamientos" && <TreatmentPlansSection pacienteId={patient.id} />}
          {activeTab === "archivos" && <FilesSection pacienteId={patient.id} />}
          {activeTab === "cuenta_corriente" && <CuentaCorrienteSection pacienteId={patient.id} />}
          {activeTab === "recordatorios" && <RemindersSection pacienteId={patient.id} />}
          {activeTab === "turnos" && <TurnosSection pacienteId={patient.id} />}
        </div>
      </div>
    </div>
  )
}


