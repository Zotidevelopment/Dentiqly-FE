import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrialLink } from '../ui/TrialLink';
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
      {/* Left — Brand Primary branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-hover,#1D4ED8)] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-9 w-auto brightness-0 invert" />
          </Link>
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight leading-tight">
            La forma más simple de gestionar tu clínica.
          </h2>
          <p className="text-white/80 text-base leading-relaxed">
            Centralizá tu agenda, historias clínicas y recordatorios automáticos en un solo lugar para enfocarte en tus pacientes.
          </p>
        </div>

        {/* Premium Floating Card Mockup */}
        <div className="relative z-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-[#2563FF] bg-[#2563FF]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Turno Confirmado
              </span>
              <span className="text-xs text-gray-400 font-medium">10:30 hs</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/assets/carlos-sanchez.png" 
                alt="Juan Pérez" 
                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80";
                }}
              />
              <div>
                <h4 className="text-sm font-bold text-[#0A0F2D]">Juan Pérez</h4>
                <p className="text-xs text-gray-500">Ortodoncia — Control Mensual</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#5C6B7B]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Recordatorio enviado</span>
              </div>
              <span className="font-semibold text-[#2563FF]">WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-1/2 flex items-center lg:justify-start lg:pl-16 xl:pl-24 justify-center p-6 sm:p-8 md:p-10 bg-[#FAFCFF]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <Link to="/">
              <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-9 w-auto" />
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-[#0B1023] mb-1">Bienvenido</h1>
            <p className="text-[var(--brand-secondary)] text-sm font-semibold">Ingresa tus credenciales para acceder</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/70 overflow-hidden">
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1023] mb-1.5 uppercase tracking-wider">
                    Correo Electronico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#8A93A8]" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023] text-sm"
                      placeholder="ejemplo@clinica.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-[#0B1023] uppercase tracking-wider">
                      Contrasena
                    </label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-[#2563FF] hover:text-[#1D4ED8] transition-colors">
                      Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#8A93A8]" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023] text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2563FF] text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.2)] hover:shadow-[0_12px_30px_rgba(37,99,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      Ingresar al sistema
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="px-6 py-4 bg-[#F7F8FA] border-t border-gray-100 text-center">
              <p className="text-xs text-[#8A93A8]">
                No tienes una cuenta?{' '}
                <TrialLink ctaLocation="login_page" ctaLabel="Registrate gratis" className="text-[#2563FF] font-bold hover:text-[#1D4ED8] transition-colors">
                  Registrate gratis
                </TrialLink>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[#8A93A8] text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Conexion segura y encriptada</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
