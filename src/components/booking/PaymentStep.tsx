import React, { useState, useEffect } from "react"
import { Servicio, Profesional, CrearPacienteData } from "../../types"
import { configuracionApi } from "../../api/configuracion"
import { 
  Building2, 
  Info,
  Clock,
  User,
  Calendar,
  Wallet,
  Phone,
  Loader2
} from "lucide-react"
import { WhatsAppIcon } from "./DentalIcons"

interface PaymentStepProps {
  service: Servicio
  professional: Profesional
  dateTime: string
  patientData: CrearPacienteData
  loading: boolean
  onConfirm: () => void
  senaMonto?: number
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  service,
  professional,
  dateTime,
  patientData,
  loading: confirmLoading,
  onConfirm,
  senaMonto
}) => {
  const [paymentInfo, setPaymentInfo] = useState({
    amount: senaMonto || 0,
    cbu: "",
    alias: "",
    whatsapp: "",
    bank: ""
  })
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const settings = await configuracionApi.listar()
        setPaymentInfo(prev => {
          const info = { ...prev }
          settings.forEach(s => {
            if (s.clave === 'bank_cbu') info.cbu = s.valor
            if (s.clave === 'bank_alias') info.alias = s.valor
            if (s.clave === 'bank_whatsapp') info.whatsapp = s.valor
            if (s.clave === 'bank_name') info.bank = s.valor
            if (s.clave === 'sena_monto' && !senaMonto) info.amount = Number(s.valor) || 0
          })
          return info
        })
      } catch (error) {
        console.error("Error fetching bank info:", error)
      } finally {
        setFetching(false)
      }
    }
    fetchBankData()
  }, [])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563FF]" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Obteniendo datos de pago...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Reservation Summary */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
            <Info className="text-[#2563FF]" size={16} />
            Resumen de reserva
          </h3>
          
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            {[
              { icon: Clock, label: "Tratamiento", value: service.nombre, sub: `${service.duracion_estimada} min` },
              { icon: User, label: "Profesional", value: `${professional.nombre} ${professional.apellido}`, sub: professional.especialidad },
              { icon: Calendar, label: "Fecha y Hora", value: formatDate(dateTime), sub: `${formatTime(dateTime)} hs`, accent: true },
              { icon: User, label: "Paciente", value: `${patientData.nombre} ${patientData.apellido}`, sub: `DNI: ${patientData.numero_documento}` }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#2563FF] flex-shrink-0 border border-gray-50">
                  <item.icon size={14} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className={`font-bold text-sm ${item.accent ? 'text-[#2563FF]' : 'text-gray-900'} capitalize leading-tight`}>{item.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Data */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest">
            <Wallet className="text-[#2563FF]" size={16} />
            Pago de Seña
          </h3>

          <div className="bg-white p-6 rounded-2xl border border-[#2563FF]/20 space-y-6 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-1 pb-4 border-b border-gray-100">
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider">Monto a abonar</span>
              <span className="text-3xl font-black text-[#2563FF]">${paymentInfo.amount}</span>
              <p className="text-xs text-gray-500 font-medium max-w-[200px]">Transferencia para confirmar tu turno en el sistema.</p>
            </div>

            <div className="space-y-3">
              {paymentInfo.bank && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Banco</span>
                  <span className="text-sm font-bold text-gray-900">{paymentInfo.bank}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Alias</span>
                <span className="text-sm font-bold text-gray-900">{paymentInfo.alias || 'No configurado'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">CBU / CVU</span>
                <span className="text-xs font-bold text-gray-900">{paymentInfo.cbu || 'No configurado'}</span>
              </div>
            </div>

            {paymentInfo.whatsapp && (
              <a 
                href={`https://wa.me/${paymentInfo.whatsapp}?text=${encodeURIComponent(`Hola! Envío comprobante de seña para mi turno de ${service.nombre} el día ${formatDate(dateTime)} a las ${formatTime(dateTime)}hs.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#25D366]/10 text-[#128C7E] rounded-xl border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all font-bold uppercase tracking-wider text-[10px]"
              >
                <div className="p-1.5 bg-[#25D366] text-white rounded-md flex-shrink-0">
                  <WhatsAppIcon size={14} />
                </div>
                <span>Enviar Comprobante</span>
              </a>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={onConfirm}
        disabled={confirmLoading}
        className="w-full mt-4 h-14 bg-[#2563FF] text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all uppercase tracking-widest disabled:opacity-50"
      >
        {confirmLoading ? "Confirmando..." : "CONFIRMAR TURNO"}
      </button>
    </div>
  )
}

