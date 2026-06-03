import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Zap, 
  ShieldAlert, 
  Headphones, 
  Database, 
  ArrowRight,
  TrendingUp,
  Sparkles
} from "lucide-react"

interface BenefitItem {
  icon: React.ReactNode
  title: string
  description: string
  tag?: string
}

const benefits: BenefitItem[] = [
  {
    icon: <Zap className="h-6 w-6 text-[#0047FF]" />,
    title: "Configuración en 10 minutos",
    description: "Importamos tus datos y configuramos tu agenda al instante para que no pierdas ni un solo turno.",
    tag: "Rápido"
  },
  {
    icon: <ShieldAlert className="h-6 w-6 text-[#0047FF]" />,
    title: "Sin contratos ni permanencia",
    description: "Creemos en la calidad de nuestro producto. Sos libre de cancelar cuando quieras, sin trabas ni letra chica.",
    tag: "Flexible"
  },
  {
    icon: <Headphones className="h-6 w-6 text-[#0047FF]" />,
    title: "Soporte humano 24/7",
    description: "Un equipo real de expertos listo para ayudarte por WhatsApp, teléfono o email cuando lo necesites.",
    tag: "VIP"
  },
  {
    icon: <Database className="h-6 w-6 text-[#0047FF]" />,
    title: "Migración gratuita de datos",
    description: "¿Usás planillas, Excel u otro sistema? Nos encargamos de mudar todo a Dentiqly sin ningún costo.",
    tag: "Gratis"
  },
  {
    icon: <Sparkles className="h-6 w-6 text-[#0047FF]" />,
    title: "Actualizaciones incluidas",
    description: "Accedé a todas las nuevas herramientas y mejoras del sistema automáticamente, sin pagar de más.",
    tag: "Siempre al día"
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-[#0047FF]" />,
    title: "Capacitación a tu equipo",
    description: "Te guiamos con entrenamientos rápidos y personalizados para que tu personal domine el sistema en un día.",
    tag: "Acompañamiento"
  }
]

export const PerformanceSection: React.FC = () => {
  return (
    <section
      id="por-que-dentiqly"
      className="relative bg-white text-[#0A0F2D] py-24 sm:py-32 overflow-hidden border-t border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-24"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0047FF]/10 text-[#0047FF] mb-6">
            <CheckCircle2 size={12} className="text-[#0047FF]" /> Por qué elegirnos
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0F2D] mb-6">
            La transición más simple. <br />
            <span className="text-[#0047FF]">
              El impacto más grande.
            </span>
          </h2>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Diseñamos Dentiqly para resolver las fricciones de la gestión diaria. Sin contratos forzados, sin sorpresas y con todo el soporte que necesitás.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative bg-[#FAFCFF] border border-gray-100 hover:border-[#0047FF]/30 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:border-[#0047FF]/25">
                    {benefit.icon}
                  </div>
                  {benefit.tag && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 group-hover:text-[#0047FF] transition-colors">
                      {benefit.tag}
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-[#0A0F2D] group-hover:text-[#0047FF] transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 group-hover:text-gray-600 transition-colors">
                  {benefit.description}
                </p>
              </div>

              {/* Decorative small checkmark */}
              <div className="flex items-center gap-1.5 mt-6 text-xs text-[#0047FF] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <span>Garantizado</span>
                <CheckCircle2 size={12} className="text-[#0047FF]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action / CTA Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative rounded-3xl bg-[#0047FF] p-8 sm:p-12 shadow-xl overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="relative z-10 max-w-lg text-white">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                ¿Listo para ver la diferencia?
              </h3>
              <p className="text-white/90 text-sm sm:text-base mb-2 font-medium">
                Probá Dentiqly GRATIS por 14 días con todas las funciones activas.
              </p>
              <p className="text-white/70 text-xs font-normal">
                No requiere tarjeta de crédito • Configuración en minutos • Cancelá en cualquier momento.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0047FF] font-extrabold text-sm rounded-full hover:bg-gray-50 transition-all shadow-lg hover:scale-[1.02]"
              >
                Empezá GRATIS ahora
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
