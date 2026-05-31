import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Calendar, MessageSquare, CreditCard } from 'lucide-react';

export const BentoGridSection: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#FAFCFF]">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Top Left Card - col-span-2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 bg-[#0047ff] rounded-[2rem] p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden flex flex-col justify-end min-h-[400px]"
          >
            {/* Placeholder for 3D Icon */}
            <div className="absolute top-8 right-8 w-32 h-32 md:w-48 md:h-48">
              <div className="w-full h-full bg-white/10 rounded-2xl border-2 border-dashed border-white/30 flex items-center justify-center relative transform rotate-12 transition-transform hover:rotate-0 duration-500">
                <span className="text-[#ffffff] text-sm font-medium absolute -bottom-6 text-center w-full">Espacio 3D</span>
                <Award className="w-16 h-16 text-[#ffffff]/50" />
              </div>
            </div>

            <div className="max-w-md relative z-10">
              <h2 className="text-3xl md:text-4xl font-semibold text-[#ffffff] mb-4 tracking-[-2px] leading-tight">
                Diseñado por expertos en odontología
              </h2>
              <p className="text-lg text-[#ffffff] leading-relaxed">
                Nuestro equipo combina años de experiencia clínica con tecnología de punta. Esa experiencia se traduce en una plataforma construida para la velocidad, claridad y excelencia operativa.
              </p>
            </div>
          </motion.div>

          {/* Top Right Card - col-span-1 (Image Placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-1 bg-gray-50 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 overflow-hidden relative min-h-[400px] flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#e5e7eb_10px,#e5e7eb_20px)] opacity-20"></div>
            <div className="text-center relative z-10 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Espacio para tu imagen</p>
              <p className="text-sm text-gray-400 mt-1">Recomendado: 800x800px</p>
            </div>
          </motion.div>

          {/* Bottom Left Card - col-span-1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-1 bg-[#0A0F2D] rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative flex flex-col justify-end min-h-[400px]"
          >
            {/* Placeholder for 3D Icon */}
            <div className="absolute top-10 left-10 w-24 h-24 md:w-32 md:h-32">
              <div className="w-full h-full bg-[#ffffff] rounded-2xl border-2 border-dashed border-amber-200 flex items-center justify-center relative transform -rotate-6 transition-transform hover:rotate-0 duration-500">
                <span className="text-[#ffffff] text-xs font-medium absolute -bottom-6 text-center w-full">Espacio 3D</span>
                <ShieldCheck className="w-12 h-12 text-[#ffffff]" />
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <h3 className="text-2xl md:text-3xl font-semibold text-[#ffffff] mb-3 tracking-[-2px] leading-tight">
                Seguridad de datos dental empresarial
              </h3>
              <p className="text-base text-[#ffffff] leading-relaxed">
                Diseñado para grandes clínicas, Dentiqly cumple con los más altos estándares de seguridad y protección de datos médicos.
              </p>
            </div>
          </motion.div>

          {/* Bottom Right Card - col-span-2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 bg-white rounded-[2rem] p-10 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden flex flex-col min-h-[400px]"
          >
            <div className="max-w-md relative z-10 mb-auto">
              <h3 className="text-3xl md:text-4xl font-semibold text-[#0A0F2D] mb-4 tracking-[-2px] leading-tight">
                Integraciones para tu clínica dental
              </h3>
              <p className="text-lg text-gray-500 leading-relaxed mb-8">
                Dentiqly se integra perfectamente con las herramientas que ya usas, conectando todos los puntos de tu clínica para una gestión unificada.
              </p>
            </div>

            {/* Integrations Pills area */}
            <div className="flex flex-wrap gap-3 mt-8 relative z-10">
              <IntegrationPill icon={<Calendar className="w-4 h-4" />} text="Google Calendar" color="text-[#0A0F2D]" bg="bg-[#0047FF]/10" />
              <IntegrationPill icon={<MessageSquare className="w-4 h-4" />} text="WhatsApp" color="text-green-600" bg="bg-green-50" />
              <IntegrationPill icon={<CreditCard className="w-4 h-4" />} text="Mercado Pago" color="text-[#0047FF]" bg="bg-[#0047FF]/10" />
              <IntegrationPill icon={<CreditCard className="w-4 h-4" />} text="Stripe" color="text-indigo-600" bg="bg-indigo-50" />
              <div className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                +15 integraciones
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const IntegrationPill = ({ icon, text, color, bg }: { icon: React.ReactNode, text: string, color: string, bg: string }) => (
  <div className={`px-4 py-2 rounded-full flex items-center gap-2 border border-white/50 shadow-sm ${bg}`}>
    <div className={`${color}`}>
      {icon}
    </div>
    <span className={`text-sm font-semibold ${color}`}>{text}</span>
  </div>
);
