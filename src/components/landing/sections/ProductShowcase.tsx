import React from "react"
import {
  Calendar,
  Users,
  Bell,
  LayoutDashboard,
  Building2,
  ArrowRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const features = [
  {
    icon: Calendar,
    tag: "TURNOS",
    title: "Tus pacientes agendan solos, 24/7",
    desc: "Agenda online inteligente. Tus pacientes reservan sin llamadas ni demoras. Vos solo atendés.",
    src: "/assets/screenshots/calendario.png",
    span: "lg:col-span-2",
    imgHeight: "h-[220px] sm:h-[300px]",
    highlight: true,
  },
  {
    icon: Users,
    tag: "HISTORIAS CLÍNICAS",
    title: "Todo el historial en un clic",
    desc: "Ficha completa del paciente: datos, odontograma, tratamientos, pagos y más.",
    src: "/assets/screenshots/paciente-detalle.png",
    span: "lg:col-span-1",
    imgHeight: "h-[160px] sm:h-[200px]",
  },
  {
    icon: Bell,
    tag: "RECORDATORIOS",
    title: "40% menos ausencias",
    desc: "Recordatorios automáticos por email para que ningún paciente falte.",
    src: "/assets/screenshots/recordatorios.png",
    span: "lg:col-span-1",
    imgHeight: "h-[160px] sm:h-[200px]",
  },
  {
    icon: LayoutDashboard,
    tag: "DASHBOARD",
    title: "Toda tu clínica en una pantalla",
    desc: "Métricas de facturación, turnos del día, inasistencias y rendimiento en tiempo real.",
    src: "/assets/screenshots/dashboard.png",
    span: "lg:col-span-1",
    imgHeight: "h-[160px] sm:h-[200px]",
  },
  {
    icon: Building2,
    tag: "MULTI-SUCURSAL",
    title: "Todas tus sedes, un solo panel",
    desc: "Gestioná múltiples clínicas desde un único lugar. Comparar rendimiento nunca fue tan fácil.",
    src: "/assets/screenshots/booking.png",
    span: "lg:col-span-1",
    imgHeight: "h-[160px] sm:h-[200px]",
  },
]

export const ProductShowcase: React.FC = () => {
  return (
    <section
      id="funcionalidades"
      className="py-20 sm:py-28 bg-[#FAFCFF] relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bento-header text-center mb-14"
        >
          <span className="inline-block bg-[#0047FF]/[0.08] text-[#0047FF] px-4 py-1.5 text-[13px] font-bold tracking-wide rounded-full mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0A0F2D] tracking-[-2px] leading-[1.1] mb-4">
            Todo lo que tu clínica necesita.
            <br />
            <span className="text-[#0047FF]">Nada que no necesite.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Cada función está diseñada para que <span className="font-semibold text-[#0A0F2D]">atiendas más pacientes en menos tiempo</span> y factures más.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="bento-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`bento-card group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-full ${feat.span} ${
                  feat.highlight
                    ? "bg-[#0A0F2D] border-[#0A0F2D] text-white"
                    : "bg-white border-gray-100 hover:border-[#0047FF]/20"
                }`}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      feat.highlight ? "bg-[#0047FF]/20" : "bg-[#0047FF]/[0.08]"
                    }`}>
                      <Icon className="w-4 h-4 text-[#0047FF]" />
                    </div>
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${
                      feat.highlight ? "text-[#0047FF]" : "text-[#0047FF]"
                    }`}>
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 tracking-[-0.5px] ${
                    feat.highlight ? "text-white" : "text-[#0A0F2D]"
                  }`}>
                    {feat.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    feat.highlight ? "text-white/60" : "text-gray-500"
                  }`}>
                    {feat.desc}
                  </p>
                </div>

                {/* Screenshot pinned to the bottom */}
                <div className="mt-auto px-6 overflow-hidden">
                  <img
                    src={feat.src}
                    alt={`Dentiqly - ${feat.title}`}
                    loading="lazy"
                    className={`w-full ${feat.imgHeight} object-cover object-left-top rounded-t-xl border border-gray-200/20 shadow-md transition-transform duration-500 group-hover:scale-[1.02]`}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-[#0047FF] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-[#0047FF]/25 hover:bg-[#0036CC] hover:shadow-xl transition-all duration-300 group"
          >
            Empezá gratis y descubrí todas las funcionalidades
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-gray-400 mt-3">Sin tarjeta de crédito · 14 días gratis</p>
        </motion.div>
      </div>
    </section>
  )
}
