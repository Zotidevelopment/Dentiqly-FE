"use client"

import React from "react"
import { Link } from "react-router-dom"
import { Check, Calendar, User, Clock, ArrowRight, Printer } from "lucide-react"

interface BookingSuccessProps {
  appointmentData: {
    service: string
    professional: string
    dateTime: string
    patientName: string
    patientPhone: string
    patientEmail: string
    patientDni?: string
  }
  onNewBooking: () => void
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ appointmentData, onNewBooking }) => {
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
    }
  }

  const { date, time, year } = formatDateTime(appointmentData.dateTime)

  return (
    <div className="max-w-xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(37,99,255,0.12)] border border-blue-50/50 overflow-hidden relative printable-card">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none no-print" />

        <div className="p-10 sm:p-14 text-center relative z-10">
          {/* Success Ring */}
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-[#2563FF] rounded-full blur-2xl opacity-20 animate-pulse no-print" />
            <div className="w-28 h-28 rounded-full bg-[#2563FF] text-white flex items-center justify-center relative shadow-[0_20px_40px_-10px_rgba(37,99,255,0.4)]">
              <Check size={52} strokeWidth={3.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-[#2563FF] no-print">
              <div className="w-2 h-2 rounded-full bg-[#2563FF]" />
            </div>
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">¡Turno Confirmado!</h2>
          <p className="text-gray-400 font-medium mb-12 text-lg no-print">
            Todo listo, <span className="text-[#2563FF] font-bold">{appointmentData.patientName.split(' ')[0]}</span>. Tu cita ha sido agendada con éxito.
          </p>

          {/* Details Card */}
          <div className="bg-[#f8faff] rounded-[2.5rem] p-8 space-y-7 mb-12 text-left border border-blue-50/50 relative group transition-all hover:bg-[#f2f6ff]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#2563FF] group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Fecha y Año</p>
                <p className="font-black text-gray-900 text-lg capitalize">{date} <span className="text-gray-300 font-bold">{year}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#2563FF] group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Hora de Cita</p>
                <p className="font-black text-gray-900 text-lg">{time} hs</p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#2563FF] group-hover:scale-110 transition-transform">
                <User size={24} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Profesional</p>
                <p className="font-black text-gray-900 text-lg">{appointmentData.professional}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-3 w-full bg-[#2563FF] text-white py-5 px-10 rounded-3xl font-black text-lg shadow-[0_20px_40px_-10px_rgba(37,99,255,0.3)] hover:bg-blue-700 transition-all transform hover:-translate-y-1 active:scale-95 group-hover:shadow-[0_25px_50px_-12px_rgba(37,99,255,0.4)]"
            >
              Descargar Comprobante
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-6 pt-4">
              <button
                onClick={onNewBooking}
                className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#2563FF] transition-colors"
              >
                Nuevo turno
              </button>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
              <Link
                to="/"
                className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#2563FF] transition-colors"
              >
                Cerrar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
