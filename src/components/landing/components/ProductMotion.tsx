import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import type { ProductIconName } from '../ui/ProductIcon';

const descriptions: Record<ProductIconName, string> = {
  booking: 'Un paciente elige un día y un horario y envía su solicitud de turno.',
  agenda: 'Recepción selecciona un paciente, un profesional y un horario. El turno aparece en la agenda.',
  patient: 'El profesional abre la ficha clínica, consulta el odontograma y guarda un registro por pieza.',
  finance: 'Recepción registra un ingreso por transferencia y la caja refleja el nuevo movimiento.',
};

/** Exported motion graphics keep the public page independent of the rendering studio. */
export function ProductMotion({ variant }: { variant: ProductIconName }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const requested = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    requested.current = !preference.matches;
    const sync = () => {
      if (requested.current && visible.current && !document.hidden) {
        void element.play().catch(() => setPlaying(false));
      } else element.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      sync();
    }, { threshold: 0.15 });
    const onPreference = () => {
      requested.current = !preference.matches;
      sync();
    };
    observer.observe(element);
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', sync);
      element.pause();
    };
  }, [variant]);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    requested.current = element.paused;
    if (element.paused) void element.play().catch(() => setPlaying(false));
    else element.pause();
  };

  return <figure className={`lp-motion lp-motion-${variant}`}>
    <div className="lp-motion-screen">
      <video
        key={variant}
        ref={video}
        muted loop playsInline preload="metadata"
        poster={`/assets/motion/${variant}-poster.webp`}
        width={1120} height={840}
        aria-label={descriptions[variant]}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={event => {
          const element = event.currentTarget;
          setProgress(element.duration ? element.currentTime / element.duration : 0);
        }}
      >
        <source src={`/assets/motion/${variant}-loop.webm`} type="video/webm" />
        {descriptions[variant]}
      </video>
      <div className="lp-motion-controls">
        <span>ASÍ FUNCIONA <i /> 8 segundos</span>
        <button type="button" onClick={toggle} aria-label={playing ? 'Pausar demostración' : 'Reproducir demostración'}>
          {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          {playing ? 'Pausar' : 'Reproducir'}
        </button>
      </div>
      <div className="lp-motion-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
    </div>
    <figcaption>Demostración animada · Datos de ejemplo</figcaption>
  </figure>;
}
