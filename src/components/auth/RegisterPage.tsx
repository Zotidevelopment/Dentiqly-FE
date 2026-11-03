import { AuthBrandPanel } from '../brand/AuthBrandPanel'
import { BrandLogo } from '../brand/BrandLogo'
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Building2, User, Mail, Lock, Loader2, Phone, Check } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { SEO, PAGE_SEO } from '../seo/SEO';
import { trackSignupStarted } from '../../lib/analytics';
import { ContinuarConGoogle, type SesionGoogle } from './ContinuarConGoogle';


/**
 * Réplica de utils/slugify.js del backend, que es quien genera el slug real a
 * partir del nombre de la clínica.
 *
 * Sirve solo para previsualizar la URL de reservas mientras se escribe. El
 * backend puede agregarle un sufijo (-1, -2) si el slug ya está tomado, así
 * que esto es una aproximación, no una promesa.
 */
const previsualizarSlug = (nombre: string): string =>
  nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

/**
 * `text-base` (16px) en móvil no es una decisión estética: Safari en iOS hace
 * zoom automático sobre cualquier input de menos de 16px al enfocarlo, y el
 * formulario entero queda descuadrado. Desde `sm` vuelve a 14px, que es lo que
 * pide el diseño en pantallas donde el problema no existe.
 */
const inputClass =
  'block w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-[#F7F8FA] border border-transparent rounded-xl ' +
  'focus:ring-2 focus:ring-[#2458ED]/20 focus:border-[#2458ED] focus:bg-white transition-all text-[#0B2440]';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  // signup_started se emite en la primera tecla, no al cargar la página:
  // llegar a /register ya lo cubre page_view. Lo que importa acá es la
  // intención real de completar el formulario.
  const signupStartedRef = React.useRef(false);

  // Lo imprescindible para crear la cuenta, más el teléfono: es el canal por
  // el que se contacta a la clínica después del registro. El resto de los
  // datos se piden en el onboarding, cuando la persona ya entró y tiene algo
  // que ganar completándolos.
  const [formData, setFormData] = useState({
    nombre_clinica: '',
    nombre_admin: '',
    email_admin: '',
    telefono: '',
    password: '',
  });

  // Con Google la clínica arranca en prueba gratis y va directo al panel
  // (donde la recibe el onboarding). Si el email ya tenía cuenta, entra.
  const entrarConGoogle = (r: SesionGoogle) => {
    const slug = r.tenant?.slug || r.clinica?.slug;
    toast({
      title: r.nuevo ? "¡Bienvenido a Dentiqly!" : "Ya tenías una cuenta",
      description: r.nuevo ? "Tu prueba gratuita de 7 días ya empezó." : "Te llevamos a tu panel.",
    });
    navigate(slug ? `/${slug}/admin` : '/admin');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_clinica || !formData.nombre_admin || !formData.email_admin || !formData.telefono || !formData.password) {
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
    crearCuenta();
  };

  // Toda clínica nueva arranca con la prueba gratis, sin tarjeta. La tarjeta
  // se pide recién cuando la prueba vence (ver AdminApp → OnboardingWizard).
  const crearCuenta = async () => {
    setLoading(true);
    try {
      const response = await register({
        ...formData,
        plan_choice: 'trial',
      } as any);
      toast({
        title: "¡Bienvenido a Dentiqly!",
        description: "Tu prueba gratuita de 7 días ya empezó. ¡A trabajar!",
      });
      navigate(response.tenant?.slug ? `/${response.tenant.slug}/admin` : '/admin');
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
    <SEO {...PAGE_SEO.register} />
    <div className="dentiqly-auth min-h-screen flex items-stretch">
      <AuthBrandPanel title={"Un lugar para todo lo que pasa en tu clínica."} description={"Creá tu cuenta y empezá a conectar la agenda, la atención y la administración de tu consultorio."} />

      {/* Right — Form / Plan selection */}
      <div className="dentiqly-auth-form w-full lg:w-[56%] flex items-center lg:justify-start lg:pl-16 xl:pl-24 justify-center p-6 sm:p-8 md:p-10 bg-[#FAFCFF]">
        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-6">
            <Link to="/">
              <BrandLogo alt="Dentiqly" className="h-9 w-auto" />
            </Link>
          </div>

              <div className="mb-5">
                <h1 className="text-2xl font-extrabold text-[#0B2440] mb-1">Crear nueva clínica</h1>
                <p className="text-[var(--brand-secondary)] text-sm font-semibold">Configurá tu espacio de trabajo en segundos.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/70 p-6">
                <ContinuarConGoogle
                  texto="signup_with"
                  onSesion={entrarConGoogle}
                  onError={(mensaje) => toast({ title: "No pudimos registrarte con Google", description: mensaje, variant: "destructive" })}
                />

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="nombre_clinica" className="block text-xs font-bold text-[#0B2440] mb-1 uppercase tracking-wider">Nombre de tu clínica</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-4 w-4 text-[#8A93A8]" />
                      </div>
                      <input
                        id="nombre_clinica"
                        type="text"
                        name="nombre_clinica"
                        required
                        autoComplete="organization"
                        value={formData.nombre_clinica}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ej: Clínica Dental"
                      />
                    </div>
                    {/* La URL de reservas sale del nombre: se muestra para que se
                        entienda qué se está creando, no para que la configuren. */}
                    <p className="mt-1 text-[11px] text-[#8A93A8]">
                      Tu página de reservas va a ser{' '}
                      <span className="font-semibold text-[#2458ED]">
                        dentiqly.com/{previsualizarSlug(formData.nombre_clinica) || 'tu-clinica'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label htmlFor="nombre_admin" className="block text-xs font-bold text-[#0B2440] mb-1 uppercase tracking-wider">Tu nombre</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-[#8A93A8]" />
                      </div>
                      <input
                        id="nombre_admin"
                        type="text"
                        name="nombre_admin"
                        required
                        autoComplete="name"
                        value={formData.nombre_admin}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email_admin" className="block text-xs font-bold text-[#0B2440] mb-1 uppercase tracking-wider">Email profesional</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-[#8A93A8]" />
                      </div>
                      <input
                        id="email_admin"
                        type="email"
                        name="email_admin"
                        required
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={formData.email_admin}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="ejemplo@clinica.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-xs font-bold text-[#0B2440] mb-1 uppercase tracking-wider">Teléfono / WhatsApp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-[#8A93A8]" />
                      </div>
                      <input
                        id="telefono"
                        type="tel"
                        name="telefono"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="+54 9 11 0000-0000"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#8A93A8]">
                      Para ayudarte a configurar tu clínica y resolverte dudas.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-[#0B2440] mb-1 uppercase tracking-wider">Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-[#8A93A8]" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="disabled:opacity-60 w-full bg-[#2458ED] text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-[#1744CD] transition-all shadow-[0_8px_20px_rgba(37,99,255,0.2)] hover:shadow-[0_12px_30px_rgba(37,99,255,0.3)] flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {loading ? 'Creando tu clínica…' : 'Crear cuenta y empezar gratis'}
                      {loading ? null : <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>

                  <p className="flex items-center justify-center gap-1.5 text-center text-[12px] font-medium text-[#53677E] mt-3">
                    <Check className="h-3.5 w-3.5 text-[#2458ED]" />
                    7 días gratis · Sin tarjeta de crédito
                  </p>
                  <p className="text-center text-[11px] text-[#8A93A8] mt-2">
                    Al registrarte, aceptás nuestros{' '}
                    <Link to="/terminos" className="text-[#2458ED] hover:text-[#1744CD] font-semibold transition-colors">Términos de Servicio</Link> y{' '}
                    <Link to="/privacidad" className="text-[#2458ED] hover:text-[#1744CD] font-semibold transition-colors">Política de Privacidad</Link>.
                  </p>
                </form>
              </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-[#8A93A8]">
              ¿Ya tenés una cuenta?{' '}
              <Link to="/login" className="text-[#2458ED] font-bold hover:text-[#1744CD] transition-colors">
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
