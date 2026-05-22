import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, ArrowRight, User, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { SEO, PAGE_SEO } from '../seo/SEO';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      toast({
        title: "Bienvenido de nuevo!",
        description: "Sesion iniciada correctamente.",
      });
      if (response.user?.role === 'superadmin' || response.user?.email === 'riostiziano6@gmail.com') {
        navigate('/admin');
      } else if (response.clinica?.slug) {
        navigate(`/${response.clinica.slug}/admin`);
      } else {
        navigate('/admin');
      }
    } catch (error: any) {
      toast({
        title: "Error de acceso",
        description: error.response?.data?.error || "Credenciales incorrectas. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
    <SEO {...PAGE_SEO.login} />
    <div className="min-h-screen flex items-stretch">
      {/* Left — Dark branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1023] relative overflow-hidden flex-col justify-between p-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-[#2563FF]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[#02E3FF]/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-10 w-auto brightness-0 invert" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            Gestiona tu clinica con la plataforma #1 en odontologia.
          </h2>
          <p className="text-white/40 text-lg leading-relaxed mb-10">
            Agenda, historias clinicas, facturacion y mas. Todo desde un solo lugar.
          </p>

          <div className="space-y-4">
            {[
              'Agenda inteligente con recordatorios WhatsApp',
              'Odontograma digital interactivo',
              'Facturacion y control de caja integrado',
              'Panel multi-sucursal centralizado',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#02E3FF]/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#02E3FF]" />
                </div>
                <span className="text-white/60 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="p-5 bg-white/[0.04] rounded-2xl border border-white/[0.06]">
            <p className="text-white/70 text-sm italic mb-3">
              "Dentiqly nos permitio crecer un 30% en los primeros 6 meses. La agenda y los recordatorios son un antes y un despues."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563FF] to-[#02E3FF] flex items-center justify-center">
                <span className="text-white text-xs font-bold">CR</span>
              </div>
              <div>
                <p className="text-white/80 text-sm font-semibold">Dra. Claudia Ruiz</p>
                <p className="text-white/30 text-xs">Dental Care — Buenos Aires</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-[#FAFCFF]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <Link to="/">
              <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#0B1023] mb-2">Bienvenido</h1>
            <p className="text-[#8A93A8] font-medium">Ingresa tus credenciales para acceder</p>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
            <div className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#0B1023] mb-2 uppercase tracking-wider">
                    Correo Electronico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4.5 w-4.5 text-[#8A93A8]" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023] text-sm"
                      placeholder="ejemplo@clinica.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-[#0B1023] uppercase tracking-wider">
                      Contrasena
                    </label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-[#2563FF] hover:text-[#1D4ED8] transition-colors">
                      Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4.5 w-4.5 text-[#8A93A8]" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023] text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563FF] text-white py-3.5 px-6 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.25)] hover:shadow-[0_12px_30px_rgba(37,99,255,0.35)] disabled:opacity-50 flex items-center justify-center gap-2.5 mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      Ingresar al sistema
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="px-8 py-5 bg-[#F7F8FA] border-t border-gray-100 text-center">
              <p className="text-sm text-[#8A93A8]">
                No tienes una cuenta?{' '}
                <Link to="/register" className="text-[#2563FF] font-bold hover:text-[#1D4ED8] transition-colors">
                  Registrate gratis
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[#8A93A8] text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Conexion segura y encriptada</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
