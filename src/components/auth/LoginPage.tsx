import { AuthBrandPanel } from '../brand/AuthBrandPanel'
import { BrandLogo } from '../brand/BrandLogo'
import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { TrialLink } from '../ui/TrialLink';
import { useAuth } from '../../hooks/useAuth';
import { Shield, ArrowRight, User, Lock, Loader2, } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { SEO, PAGE_SEO } from '../seo/SEO';
import { ContinuarConGoogle, type SesionGoogle } from './ContinuarConGoogle';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const sesionVencida = searchParams.get('expired') === '1';
  // Solo rutas internas: evita usar el login como redirección abierta.
  const volverA = (() => {
    const r = searchParams.get('redirect') || '';
    return r.startsWith('/') && !r.startsWith('//') ? r : '';
  })();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const entrarConGoogle = (r: SesionGoogle) => {
    const slug = r.clinica?.slug || r.tenant?.slug;
    toast({ title: r.nuevo ? "¡Bienvenido a Dentiqly!" : "¡Bienvenido de nuevo!", description: r.nuevo ? "Tu prueba gratuita de 7 días ya empezó." : "Sesión iniciada con Google." });
    if (!r.nuevo && volverA && slug && volverA.startsWith(`/${slug}/`)) navigate(volverA);
    else if (r.user?.role === 'superadmin') navigate('/admin');
    else navigate(slug ? `/${slug}/admin` : '/admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Sesión iniciada correctamente.",
      });
      if (volverA && response.clinica?.slug && volverA.startsWith(`/${response.clinica.slug}/`)) {
        navigate(volverA);
      } else if (response.user?.role === 'superadmin' || response.user?.email === 'riostiziano6@gmail.com') {
        navigate('/admin');
      } else if (response.clinica?.slug) {
        navigate(`/${response.clinica.slug}/admin`);
      } else {
        navigate('/admin');
      }
    } catch (error: any) {
      toast({
        title: "Error de acceso",
        description: error.response?.status === 401
          ? "El email o la contraseña no son correctos."
          : error.message || "No pudimos iniciar sesión. Intentá de nuevo.",
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
    <div className="dentiqly-auth min-h-screen flex items-stretch">
      <AuthBrandPanel title={"Tu consultorio, listo para el próximo paciente."} description={"Volvé a tu agenda, las historias clínicas y los cobros. La información de tu equipo, en un mismo lugar."} />

      {/* Right — Login form */}
      <div className="dentiqly-auth-form w-full lg:w-[56%] flex items-center lg:justify-start lg:pl-16 xl:pl-24 justify-center p-6 sm:p-8 md:p-10 bg-[#FAFCFF]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <Link to="/">
              <BrandLogo alt="Dentiqly" className="h-9 w-auto" />
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-[#0B2440] mb-1">Bienvenido</h1>
            <p className="text-[var(--brand-secondary)] text-sm font-semibold">Ingresá con tu cuenta para continuar</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/70 overflow-hidden">
            <div className="p-6 sm:p-8">
              {sesionVencida && (
                <div role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Tu sesión venció por seguridad. Ingresá de nuevo para seguir donde estabas.
                </div>
              )}
              <ContinuarConGoogle
                texto="continue_with"
                onSesion={entrarConGoogle}
                onError={(mensaje) => toast({ title: "No pudimos entrar con Google", description: mensaje, variant: "destructive" })}
              />

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-bold text-[#0B2440] mb-1.5 uppercase tracking-wider">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#8A93A8]" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2458ED]/20 focus:border-[#2458ED] focus:bg-white transition-all text-[#0B2440] text-sm"
                      placeholder="ejemplo@clinica.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="login-password" className="block text-xs font-bold text-[#0B2440] uppercase tracking-wider">
                      Contraseña
                    </label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-[#2458ED] hover:text-[#1744CD] transition-colors">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#8A93A8]" />
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-2.5 bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2458ED]/20 focus:border-[#2458ED] focus:bg-white transition-all text-[#0B2440] text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2458ED] text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#1744CD] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.2)] hover:shadow-[0_12px_30px_rgba(37,99,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
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
                ¿Todavía no tenés una cuenta?{' '}
                <TrialLink ctaLocation="login_page" ctaLabel="Registrate gratis" className="text-[#2458ED] font-bold hover:text-[#1744CD] transition-colors">
                  Registrate gratis
                </TrialLink>
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[#8A93A8] text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Conexión segura y encriptada</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
