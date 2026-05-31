import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Building2, User, Mail, Lock, Loader2, Phone, Globe, Sparkles, CreditCard, Clock, ArrowRight, ArrowLeft, Check, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { SEO, PAGE_SEO } from '../seo/SEO';

type Step = 'form' | 'plan';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showPassword, setShowPassword] = useState(false);

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
            <p className="text-white text-sm font-medium mb-2">Podés fácilmente</p>
            <h2 className="text-[2rem] xl:text-[2.4rem] font-bold text-white leading-[1.15] tracking-[-1px]">
              {step === 'form'
                ? 'Comenzar a gestionar tu clínica con claridad y control total'
                : 'Elegir el plan perfecto para tu clínica dental'
              }
            </h2>
          </div>
        </div>

        {/* ════════ Right Panel — Form / Plan ════════ */}
        <div className="w-full lg:w-[55%] h-full overflow-y-auto flex items-start justify-center px-6 pt-12 pb-10 sm:px-10 xl:pt-16 bg-white">
          <div className="w-full max-w-[480px]">

            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
              <Link to="/">
                <img src="/assets/dentiqly-logo-blue.png" alt="Dentiqly" className="h-7 w-auto" />
              </Link>
            </div>

            {step === 'form' ? (
              <>
                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-[1.6rem] font-bold text-[#0A0F2D] tracking-[-0.5px] mb-1.5">Crear nueva clínica</h1>
                  <p className="text-[#6B7280] text-[13px]">
                    Configurá tu espacio de trabajo en segundos y empezá a gestionar pacientes, turnos y facturación.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Clínica + Admin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0F2D] mb-1">Clínica</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Building2 className="h-[18px] w-[18px] text-[#9CA3AF]" />
                        </div>
                        <input
                          type="text"
                          name="nombre_clinica"
                          required
                          value={formData.nombre_clinica}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                          placeholder="Ej: Clínica Dental"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0A0F2D] mb-1">Administrador</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <User className="h-[18px] w-[18px] text-[#9CA3AF]" />
                        </div>
                        <input
                          type="text"
                          name="nombre_admin"
                          required
                          value={formData.nombre_admin}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                          placeholder="Tu nombre"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teléfono + Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0F2D] mb-1">Teléfono</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone className="h-[18px] w-[18px] text-[#9CA3AF]" />
                        </div>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                          placeholder="+54 11 ..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0A0F2D] mb-1">Enlace de reservas</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Globe className="h-[18px] w-[18px] text-[#9CA3AF]" />
                        </div>
                        <input
                          type="text"
                          name="web_url"
                          value={formData.web_url}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                          placeholder="tu-centro"
                        />
                      </div>
                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        Tus pacientes reservarán en: <span className="font-semibold text-[#2563FF]">dentiqly.com/{formData.web_url || 'tu-centro'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0F2D] mb-1">Email profesional</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-[18px] w-[18px] text-[#9CA3AF]" />
                      </div>
                      <input
                        type="email"
                        name="email_admin"
                        required
                        value={formData.email_admin}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                        placeholder="ejemplo@clinica.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0F2D] mb-1">Contraseña</label>
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
                        className="block w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-full focus:ring-2 focus:ring-[#2563FF]/20 focus:border-[#2563FF] transition-all text-[#0A0F2D] placeholder:text-[#9CA3AF]"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-[#0B1023] text-white py-3 px-6 rounded-full font-semibold text-sm hover:bg-[#131B3A] transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
                  </button>

                  {/* Divider */}
                  <div className="relative my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E5E7EB]"></div>
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-center text-xs text-[#9CA3AF]">
                    Al registrarte, aceptás nuestros{' '}
                    <Link to="/terminos" className="text-[#2563FF] hover:text-[#1D4ED8] font-medium transition-colors">Términos de Servicio</Link> y{' '}
                    <Link to="/privacidad" className="text-[#2563FF] hover:text-[#1D4ED8] font-medium transition-colors">Política de Privacidad</Link>.
                  </p>
                </form>
              </>
            ) : (
              <>
                {/* Plan Selection Step */}
                <div className="mb-6">
                  <button
                    onClick={() => setStep('form')}
                    className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#0A0F2D] transition-colors mb-4"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                  </button>
                  <h1 className="text-[1.75rem] font-bold text-[#0A0F2D] tracking-[-0.5px] mb-2">Elegí tu plan</h1>
                  <p className="text-[#6B7280] text-[15px]">
                    Registrando: <span className="text-[#0A0F2D] font-bold">{formData.nombre_clinica}</span>
                  </p>
                </div>

                {/* Trial Option */}
                <button
                  onClick={() => handlePlanSelect('trial')}
                  disabled={loading}
                  className="w-full mb-4 bg-white rounded-[2rem] border-2 border-[#02E3FF]/30 p-5 text-left hover:border-[#02E3FF] hover:shadow-[0_4px_20px_rgba(2,227,255,0.1)] transition-all group disabled:opacity-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#02E3FF]/20 to-[#02E3FF]/5 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-[#02E3FF]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0A0F2D] text-base">Prueba Gratuita</h3>
                        <p className="text-sm text-[#9CA3AF]">14 días sin compromiso</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#02E3FF]/10 text-[#0891B2] text-xs font-bold uppercase">
                      Gratis
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                    <Clock className="h-4 w-4" />
                    <span>Acceso completo sin tarjeta de crédito</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#02E3FF] group-hover:text-[#0891B2] transition-colors">
                    Comenzar prueba gratuita
                    <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
                  </div>
                </button>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E5E7EB]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-[#9CA3AF] font-bold tracking-wider">o avanzá con el plan</span>
                  </div>
                </div>

                {/* Billing cycle toggle */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-[#0B1023] text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Mensual
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                      billingCycle === 'annual'
                        ? 'bg-[#0B1023] text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Anual
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      billingCycle === 'annual' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                    }`}>
                      -10%
                    </span>
                  </button>
                </div>

                {/* Paid Plan Card */}
                <button
                  onClick={() => handlePlanSelect(billingCycle)}
                  disabled={loading}
                  className="w-full bg-white rounded-[2rem] border-2 border-[#0B1023]/20 p-5 text-left hover:border-[#0B1023] hover:shadow-[0_4px_20px_rgba(11,16,37,0.05)] transition-all group disabled:opacity-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0B1023]/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-[#0B1023]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0A0F2D] text-base">Plan Pro</h3>
                        <p className="text-sm text-[#9CA3AF]">
                          {billingCycle === 'monthly' ? 'Suscripción mensual' : 'Suscripción anual'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-[#0A0F2D]">
                        ${billingCycle === 'monthly'
                          ? monthlyPrice.toLocaleString('es-AR')
                          : annualMonthly.toLocaleString('es-AR')
                        }
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        ARS / mes
                        {billingCycle === 'annual' && (
                          <span className="block text-green-600 font-bold">
                            ${annualPrice.toLocaleString('es-AR')} /año
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {[
                      'Usuarios y profesionales ilimitados',
                      'Gestión de turnos y agenda online',
                      'Historias clínicas y odontogramas',
                      'Facturación y control de caja',
                      'Recordatorios por WhatsApp',
                      'Soporte prioritario 24/7',
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <Check className="h-3.5 w-3.5 text-[#0B1023] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0B1023] group-hover:text-[#131B3A] transition-colors">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        Avanzar con el plan de pago
                        <ArrowRight className="h-4 w-4" strokeWidth={1.2} />
                      </>
                    )}
                  </div>
                </button>
              </>
            )}

            {/* Bottom link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#9CA3AF]">
                ¿Ya tenés una cuenta?{' '}
                <Link to="/login" className="text-[#0B1023] font-semibold hover:text-[#131B3A] transition-colors">
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
