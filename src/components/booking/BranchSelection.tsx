import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Globe, ChevronRight, Loader2 } from 'lucide-react';
import { sucursalesApi } from '../../api';

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  web_url?: string;
}

interface BranchSelectionProps {
  onBranchSelect: (branch: Sucursal) => void;
  selectedBranch: Sucursal | null;
}

export const BranchSelection: React.FC<BranchSelectionProps> = ({ onBranchSelect, selectedBranch }) => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        // En el flujo de reserva pública, el slug ya debería estar en la URL o resuelto
        // por el tenantResolver en el backend.
        const data = await sucursalesApi.listar();
        setSucursales(data as Sucursal[]);
      } catch (error) {
        console.error("Error al cargar sucursales:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSucursales();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Buscando sucursales disponibles...</p>
      </div>
    );
  }

  if (sucursales.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-bold text-lg">No hay sucursales configuradas.</p>
        <p className="text-gray-400">Por favor, contacte con la clínica.</p>
      </div>
    );
  }

  // Si solo hay una sucursal, podríamos seleccionarla automáticamente y saltar el paso,
  // pero el usuario pidió que se pueda seleccionar, así que las mostramos.

  return (
    <div className="grid grid-cols-1 gap-4">
      {sucursales.map((sucursal) => (
        <button
          key={sucursal.id}
          onClick={() => onBranchSelect(sucursal)}
          className={`group relative p-6 text-left rounded-2xl border-2 transition-all duration-300 hover:shadow-md ${
            selectedBranch?.id === sucursal.id
              ? "border-[#2563FF] bg-[#2563FF]/5 ring-1 ring-[#2563FF]"
              : "border-gray-100 bg-white hover:border-blue-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${
                  selectedBranch?.id === sucursal.id ? "bg-[#2563FF] text-white" : "bg-blue-50 text-[#2563FF] group-hover:bg-[#2563FF] group-hover:text-white"
                }`}>
                  <MapPin size={20} />
                </div>
                <h4 className="font-bold text-lg text-gray-900">{sucursal.nombre}</h4>
              </div>
              
              <div className="space-y-1.5 ml-1">
                <p className="text-gray-600 flex items-center gap-2 text-sm">
                  <span className="font-medium">{sucursal.direccion}</span>
                </p>
                {sucursal.telefono && (
                  <p className="text-gray-500 flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    <span>{sucursal.telefono}</span>
                  </p>
                )}
              </div>
            </div>

            <div className={`mt-2 p-2 rounded-full transition-all ${
              selectedBranch?.id === sucursal.id ? "bg-[#2563FF] text-white rotate-90" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#2563FF] group-hover:translate-x-1"
            }`}>
              <ChevronRight size={20} />
            </div>
          </div>

          {selectedBranch?.id === sucursal.id && (
            <div className="absolute top-4 right-12">
              <span className="bg-[#2563FF] text-white text-[10px] font-black px-2 py-1 rounded-full tracking-wider uppercase">
                Seleccionado
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
