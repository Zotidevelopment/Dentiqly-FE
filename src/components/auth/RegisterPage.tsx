import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../lib/api-client';
import { Shield, CheckCircle2, ArrowRight, Building2, User, Mail, Lock, Loader2, Phone, Globe, Sparkles, CreditCard, Clock, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { SEO, PAGE_SEO } from '../seo/SEO';
import { trackSignupStarted } from '../../lib/analytics';

type Step = 'form' | 'plan';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  // signup_started se emite en la primera tecla, no al cargar la página:
  // llegar a /register ya lo cubre page_view. Lo que importa acá es la
  // intención real de completar el formulario.
  const signupStartedRef = React.useRef(false);

  const [formData, setFormData] = useState({
    nombre_clinica: '',
    nombre_admin: '',
    email_admin: '',
    password: '',
    telefono: '',
    web_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_clinica || !formData.nombre_admin || !formData.email_admin || !formData.password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completá todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setStep('plan');
  };

  const handlePlanSelect = async (planChoice: 'trial' | 'monthly' | 'annual') => {
    setLoading(true);
    try {
      const response = await register({
        ...formData,
        plan_choice: planChoice,
      } as any);

      if (planChoice === 'trial') {
        toast({
          title: "¡Bienvenido a Dentiqly!",
          description: "Tu prueba gratuita de 14 días ha comenzado. ¡A trabajar!",
        });
        if (response.tenant?.slug) {
          navigate(`/${response.tenant.slug}/admin`);
        } else {
          navigate('/admin');
        }
      } else {
        toast({
          title: "Clínica registrada",
          description: "Redirigiendo al pago...",
        });
        if (response.tenant?.slug) {
          navigate(`/${response.tenant.slug}/admin?activate=true&plan=${planChoice}`);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error al registrarse",
        description: error.message || "Ocurrió un problema durante el registro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!signupStartedRef.current) {
      signupStartedRef.current = true;
      trackSignupStarted();
    }
    let value = e.target.value;
    if (e.target.name === 'web_url') {
      if (value.includes('/')) {
        const parts = value.split('/').filter(Boolean);
        value = parts[parts.length - 1] || '';
      }
      value = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const monthlyPrice = 80000;
  const annualPrice = 864000;
  const annualMonthly = Math.round(annualPrice / 12);

  return (
    <>
    <SEO {...PAGE_SEO.register} />
    <div className="min-h-screen flex items-stretch">
      {/* Left — Brand Primary branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-hover,#1D4ED8)] relative overflow-hidden flex-col justify-between p-12">
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
            {step === 'form'
              ? 'Comenzá tu transformación digital.'
              : 'Elegí cómo querés empezar.'
            }
          </h2>
          <p className="text-white/80 text-base leading-relaxed">
            {step === 'form'
              ? 'Configurá tu clínica en minutos y simplificá tu administración diaria.'
              : '14 días de prueba gratuita sin compromiso, o activá directamente tu suscripción.'
            }
          </p>

          <div className="space-y-3.5 mt-8">
            {(step === 'form' ? [
              'Prueba de 14 días totalmente gratis',
              'No necesitás ingresar tarjetas de crédito',
              'Configuración automática de tu especialidad',
            ] : [
              'Acceso completo sin límites',
              'Historias clínicas y odontogramas digitales',
              'Recordatorios automatizados por WhatsApp',
            ]).map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-white/95 text-sm font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4.5 w-4.5 text-white" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">Seguridad y Respaldo</span>
            </div>
            <p className="text-white/80 text-xs leading-relaxed">
              Tus datos están protegidos con encriptación AES-256 y respaldados automáticamente cada hora.
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form / Plan selection */}
      <div className="w-full lg:w-[55%] flex items-center lg:justify-start lg:pl-16 xl:pl-24 justify-center p-6 sm:p-8 md:p-10 bg-[#FAFCFF]">
        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-6">
            <Link to="/">
              <img src="/assets/dentiqly-logo.png" alt="Dentiqly" className="h-9 w-auto" />
            </Link>
          </div>

          {step === 'form' ? (
            <>
              <div className="mb-5">
                <h1 className="text-2xl font-extrabold text-[#0B1023] mb-1">Crear nueva clínica</h1>
                <p className="text-[var(--brand-secondary)] text-sm font-semibold">Configurá tu espacio de trabajo en segundos.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/70 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1023] mb-1 uppercase tracking-wider">Clínica</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-4 w-4 text-[#8A93A8]" />
                        </div>
                        <input
                          type="text"
                          name="nombre_clinica"
                          required
                          value={formData.nombre_clinica}
                          onChange={handleChange}
                          className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                          placeholder="Ej: Clínica Dental"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1023] mb-1 uppercase tracking-wider">Administrador</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-[#8A93A8]" />
                        </div>
                        <input
                          type="text"
                          name="nombre_admin"
                          required
                          value={formData.nombre_admin}
                          onChange={handleChange}
                          className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0B1023] mb-1 uppercase tracking-wider">Teléfono</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-[#8A93A8]" />
                        </div>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                          placeholder="+54 11 ..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0B1023] mb-1 uppercase tracking-wider">Enlace de reservas (Slug)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-4 w-4 text-[#8A93A8]" />
                        </div>
                        <input
                          type="text"
                          name="web_url"
                          value={formData.web_url}
                          onChange={handleChange}
                          className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                          placeholder="tu-centro"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-[#8A93A8]">
                        Reserva online en:{' '}
                        <span className="font-semibold text-[#2563FF]">dentiqly.com/{formData.web_url || 'tu-centro'}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B1023] mb-1 uppercase tracking-wider">Email profesional</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-[#8A93A8]" />
                      </div>
                      <input
                        type="email"
                        name="email_admin"
                        required
                        value={formData.email_admin}
                        onChange={handleChange}
                        className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                        placeholder="ejemplo@clinica.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0B1023] mb-1 uppercase tracking-wider">Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#8A93A8]" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#F7F8FA] border border-transparent rounded-xl focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] focus:bg-white transition-all text-[#0B1023]"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="w-full bg-[#2563FF] text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.2)] hover:shadow-[0_12px_30px_rgba(37,99,255,0.3)] flex items-center justify-center gap-2"
                    >
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-[#8A93A8] mt-3">
                    Al registrarte, aceptás nuestros{' '}
                    <Link to="/terminos" className="text-[#2563FF] hover:text-[#1D4ED8] font-semibold transition-colors">Términos de Servicio</Link> y{' '}
                    <Link to="/privacidad" className="text-[#2563FF] hover:text-[#1D4ED8] font-semibold transition-colors">Política de Privacidad</Link>.
                  </p>
                </form>
              </div>
            </>
          ) : (
            <>
              <div className="mb-5">
                <button
                  onClick={() => setStep('form')}
                  className="flex items-center gap-1.5 text-xs text-[#8A93A8] hover:text-[#0B1023] transition-colors mb-3"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Volver
                </button>
                <h1 className="text-2xl font-extrabold text-[#0B1023] mb-1">Elegí tu plan</h1>
                <p className="text-[var(--brand-secondary)] text-sm font-semibold">
                  Registrando: <span className="text-[#0B1023] font-bold">{formData.nombre_clinica}</span>
                </p>
              </div>

              {/* Trial Option */}
              <button
                onClick={() => handlePlanSelect('trial')}
                disabled={loading}
                className="w-full mb-3 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-2 border-[#02E3FF]/30 p-5 text-left hover:border-[#02E3FF] hover:shadow-[0_8px_30px_rgba(2,227,255,0.1)] transition-all group disabled:opacity-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#02E3FF]/20 to-[#02E3FF]/5 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-[#02E3FF]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B1023] text-base">Prueba Gratuita</h3>
                      <p className="text-xs text-[#8A93A8]">14 días sin compromiso</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#02E3FF]/10 text-[#0891B2] text-[10px] font-bold uppercase">
                    Gratis
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8A93A8]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Acceso completo sin tarjeta de crédito</span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-[#02E3FF] group-hover:text-[#0891B2] transition-colors">
                  Comenzar prueba gratuita
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-150"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#FAFCFF] px-3 text-[#8A93A8] font-bold tracking-wider">o avanzá con el plan</span>
                </div>
              </div>

              {/* Billing cycle toggle */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-[#2563FF] text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-[#2563FF] text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Anual
                  <span className={`text-[10px] px-1 py-0.5 rounded-md ${
                    billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-green-150 text-green-700'
                  }`}>
                    -10%
                  </span>
                </button>
              </div>

              {/* Paid Plan Card */}
              <button
                onClick={() => handlePlanSelect(billingCycle)}
                disabled={loading}
                className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border-2 border-[#2563FF]/20 p-5 text-left hover:border-[#2563FF] hover:shadow-[0_8px_30px_rgba(37,99,255,0.1)] transition-all group disabled:opacity-50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563FF]/20 to-[#2563FF]/5 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-[#2563FF]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B1023] text-base">Plan Pro</h3>
                      <p className="text-xs text-[#8A93A8]">
                        {billingCycle === 'monthly' ? 'Suscripción mensual' : 'Suscripción anual'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-[#0B1023]">
                      ${billingCycle === 'monthly'
                        ? monthlyPrice.toLocaleString('es-AR')
                        : annualMonthly.toLocaleString('es-AR')
                      }
                    </p>
                    <p className="text-[10px] text-[#8A93A8]">
                      ARS / mes
                      {billingCycle === 'annual' && (
                        <span className="block text-green-650 font-bold">
                          ${annualPrice.toLocaleString('es-AR')} /año
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3.5">
                  {[
                    'Usuarios ilimitados',
                    'Agenda online',
                    'Historias clínicas',
                    'Control de caja',
                    'WhatsApp automático',
                    'Soporte prioritario',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                      <Check className="h-3 w-3 text-[#2563FF] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2563FF] group-hover:text-[#1D4ED8] transition-colors">
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Avanzar con el plan de pago
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </div>
              </button>
            </>
          )}

          <div className="mt-5 text-center">
            <p className="text-xs text-[#8A93A8]">
              ¿Ya tenés una cuenta?{' '}
              <Link to="/login" className="text-[#2563FF] font-bold hover:text-[#1D4ED8] transition-colors">
                Iniciá sesión acá
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
