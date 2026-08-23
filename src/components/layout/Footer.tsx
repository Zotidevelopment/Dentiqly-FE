import React from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className={`bg-[#0A0F2D] text-white mt-16`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">Av. Corrientes 1234, CABA</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">+54 11 1234-5678</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-gray-400" />
                <span className="text-sm">info@centrodental.com</span>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Horarios de Atención</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-3 text-gray-400" />
                <div>
                  <p>Lunes a Viernes: 8:00 - 20:00</p>
                  <p>Sábados: 8:00 - 14:00</p>
                  <p>Domingos: Cerrado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Centro Odontológico</h3>
            <p className="text-sm text-gray-300 mb-4">
              Brindamos atención odontológica de calidad con profesionales especializados 
              y equipamiento de última generación.
            </p>
            <p className="text-xs text-gray-400">
              © 2025 Centro Odontológico. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}