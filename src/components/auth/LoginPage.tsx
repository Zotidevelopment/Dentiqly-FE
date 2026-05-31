import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { SEO, PAGE_SEO } from '../seo/SEO';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="h-screen w-screen flex font-sans overflow-hidden">

        {/* ════════ Left Panel — Branding ════════ */}
        <div
          className="hidden lg:flex lg:w-[45%] h-full relative overflow-hidden flex-col justify-between p-12 xl:p-16 bg-[#0047FF] border-r border-[#E5E7EB]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        >
          {/* Logo */}
          <div className="relative z-10">
            <Link to="/">
              <img src="/assets/dentiqly-logo-white.png" alt="Dentiqly" className="h-7 w-auto" />
            </Link>
          </div>

          {/* Bottom text */}
          <div className="relative z-10 max-w-sm">
            <p className="text-white text-sm font-medium mb-2">Bienvenido de nuevo</p>
            <h2 className="text-[2rem] xl:text-[2.4rem] font-bold text-white leading-[1.15] tracking-[-1px]">
              Gestiona tu clínica con la plataforma #1 en odontología
            </h2>
          </div>
        </div>

        {/* ════════ Right Panel — Login Form ════════ */}
        <div className="w-full lg:w-[55%] h-full overflow-y-auto flex items-center justify-center p-6 sm:p-10 bg-white">
          <div className="w-full max-w-[420px]">

            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <Link to="/">
                <img src="/assets/dentiqly-logo-blue.png" alt="Dentiqly" className="h-7 w-auto" />
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[1.75rem] font-bold text-[#0A0F2D] tracking-[-0.5px] mb-2">Bienvenido</h1>
              <p className="text-[#6B7280] text-[15px]">
                Ingresá tus credenciales para acceder a tu clínica.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#0A0F2D] mb-1.5">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-[18px] w-[18px] text-[#9CA3AF]" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                    placeholder="ejemplo@clinica.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#0A0F2D] mb-1.5">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-[18px] w-[18px] text-[#9CA3AF]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-11 py-3 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link to="/forgot-password" className="text-xs font-medium text-[#2563FF] hover:text-[#1D4ED8] transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B1023] text-white py-3.5 px-6 rounded-none font-semibold text-sm hover:bg-[#131B3A] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Ingresar al sistema
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]"></div>
              </div>
            </div>

            {/* Bottom link */}
            <div className="text-center">
              <p className="text-sm text-[#9CA3AF]">
                ¿No tenés una cuenta?{' '}
                <Link to="/register" className="text-[#2563FF] font-semibold hover:text-[#1D4ED8] transition-colors">
                  Registrate gratis
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
