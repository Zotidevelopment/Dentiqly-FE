import React from "react"
import { Shield, Lock, Cloud, Database } from "lucide-react"
import { motion } from "framer-motion"

const badges = [
  {
    icon: Lock,
    title: "Encriptacion AES-256",
    desc: "Tus datos protegidos con el mismo estandar que usan los bancos.",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    desc: "Infraestructura en la nube con redundancia y alta disponibilidad.",
  },
  {
    icon: Database,
    title: "Backups Automaticos",
    desc: "Copias de seguridad cada hora. Nunca pierdas un dato.",
  },
  {
    icon: Shield,
    title: "Compliance Total",
    desc: "Cumplimos con todas las regulaciones de proteccion de datos de salud.",
  },
]

export const SecuritySection: React.FC = () => {
  return (
    <section id="seguridad" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Large Rounded Dark Navy Container Card matching the reference image 100% */}
        <div className="bg-[#0047FF] text-white rounded-[2rem] p-10 sm:p-16 lg:p-20 relative overflow-hidden">
          {/* Internal background ambient glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#2563FF]/10 rounded-full blur-[140px]" />
            <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#0047FF]/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10">
            {/* Header Content */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-center mb-6"
              >
                <span className="inline-block bg-[#0A0F2D] text-white px-4 py-1.5 text-[13px] font-semibold tracking-wide rounded-full">
                  Seguridad de nivel empresarial
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-[-3px] leading-[1.1] mb-6"
              >
                Tus datos dentales, siempre protegidos.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-sm md:text-base text-blue-100 leading-relaxed max-w-2xl mx-auto"
              >
                Dentiqly está diseñado bajo los más estrictos estándares de seguridad internacional, garantizando la privacidad y protección de toda tu información clínica.
              </motion.p>
            </div>

            {/* Horizontal divider line as in the reference image */}
            <div className="w-full h-px bg-white/10 my-12" />

            {/* Features/Badges Row separated by vertical lines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-y-0 lg:divide-x divide-white/10 gap-y-12 lg:gap-y-0">
              {badges.map((badge, i) => {
                const Icon = badge.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center justify-center p-4 text-center group transition-colors duration-300"
                  >
                    {/* Centered Icon */}
                    <div className="mb-6 flex justify-center text-white/80 group-hover:text-[#0047FF] transition-colors duration-300">
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Centered Title */}
                    <h3 className="text-lg font-bold text-white mb-3 text-center">{badge.title}</h3>

                    {/* Centered Description */}
                    <p className="text-sm text-blue-100 leading-relaxed text-center max-w-[240px] mx-auto">{badge.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
