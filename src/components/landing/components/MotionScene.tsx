import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'
import { BrandLogo } from '../../brand/BrandLogo'
import { ProductIcon, type ProductIconName } from '../ui/ProductIcon'
import './motion-scene.css'

export const MOTION_DURATION = 8
const ease = (value: number) => { const x = Math.min(1, Math.max(0, value)); return x * x * (3 - 2 * x) }
const range = (time: number, start: number, end: number) => ease((time - start) / (end - start))

function Cursor({ time, stops }: { time: number; stops: Array<[number, number, number]> }) {
  let start = stops[0], end = stops[stops.length - 1]
  for (let index = 1; index < stops.length; index++) if (time <= stops[index][0]) { start = stops[index - 1]; end = stops[index]; break }
  const progress = range(time, start[0], end[0])
  const x = start[1] + (end[1] - start[1]) * progress, y = start[2] + (end[2] - start[2]) * progress
  return <svg className="motion-cursor" style={{ left: x, top: y, opacity: time < .25 || time > 6.4 ? 0 : 1 }} width="37" height="44" viewBox="0 0 37 44" fill="none"><path d="M4 3L31 24L20 26L15 38L4 3Z" fill="#0B2440" stroke="white" strokeWidth="3" strokeLinejoin="round" /></svg>
}

function Toast({ visible, title, text }: { visible: number; title: string; text: string }) {
  return <div className="motion-toast" style={{ opacity: visible, transform: `translateY(${(1 - visible) * 18}px)` }}><span><Check size={24} strokeWidth={2.5} /></span><div><strong>{title}</strong><p>{text}</p></div></div>
}

function Booking({ time }: { time: number }) {
  const day = time > 1.5, hour = time > 2.7, submitted = time > 4.2
  return <>
    <div className="motion-booking-card motion-white-card" style={{ opacity: 1 - range(time, 4.2, 4.6), transform: `translateY(${-range(time, 4.2, 4.6) * 15}px)` }}>
      <div className="motion-booking-heading"><span className="motion-avatar">LD</span><div><small>Consultorio odontológico</small><h3>Reservá tu próximo turno</h3><p><Clock size={16} /> Control · 30 minutos</p></div></div>
      <div className="motion-booking-columns"><div className="motion-month"><div><strong>Mayo</strong><span><ChevronLeft size={17} /><ChevronRight size={17} /></span></div><div className="motion-week-labels">{['L','M','M','J','V','S','D'].map((value, index) => <span key={index}>{value}</span>)}</div><div className="motion-month-days">{Array.from({ length: 21 }, (_, index) => <span key={index} className={index === 11 && day ? 'motion-selected-day' : ''}>{index + 1}</span>)}</div></div><div className="motion-times"><strong>Horarios disponibles</strong>{['09:00','10:30','11:00'].map(value => <span key={value} className={value === '10:30' && hour ? 'motion-selected-time' : ''}>{value}{value === '10:30' && hour && <Check size={16} />}</span>)}<div className={`motion-book-button ${hour ? 'motion-button-ready' : ''}`}>Continuar <ArrowRight size={16} /></div></div></div>
      <div className="motion-booking-foot"><span className="motion-small-avatar">MG</span>María Gómez <span>Datos del paciente completos</span></div>
    </div>
    <div className="motion-booking-success motion-white-card" style={{ opacity: range(time, 4.3, 4.7), transform: `translateY(${(1 - range(time, 4.3, 4.7)) * 20}px)` }}><span className="motion-large-check"><Check size={40} strokeWidth={2} /></span><small>LISTO, MARÍA</small><h3>Solicitud de turno enviada.</h3><p>Tu consultorio ya tiene la información.</p><div><ProductIcon name="booking" size={38} /><span><strong>Control odontológico</strong><p>12 de mayo · 10:30 h · Dr. Lucas Díaz</p></span></div></div>
    <Cursor time={time} stops={[[0,880,660],[.8,620,395],[1.5,386,399],[2.7,777,379],[3.6,789,515],[4.2,789,515],[5,943,650]]} />
    <Toast visible={submitted ? range(time, 4.5, 4.9) : 0} title="Un turno. Sin llamadas de ida y vuelta." text="Tu paciente elige entre los horarios disponibles." />
  </>
}

function Agenda({ time }: { time: number }) {
  const saved = time > 4.3, form = 1 - range(time, 4.25, 4.65)
  const name = 'Carlos Sánchez'.slice(0, Math.floor(range(time, 1, 2) * 14))
  return <>
    <div className="motion-agenda-board motion-white-card"><div className="motion-board-heading"><div><small>MI CONSULTORIO</small><h3>Agenda del equipo</h3></div><span><Plus size={15} /> Nuevo turno</span></div><div className="motion-day-bar"><strong>12 de mayo</strong><span>Lucas Díaz <i /> Mariana López</span></div><div className="motion-agenda-grid"><div className="motion-agenda-hours">{['09:00','09:30','10:00','10:30','11:00'].map(hour => <span key={hour}>{hour}</span>)}</div><div className="motion-agenda-slots">{Array.from({ length: 10 }, (_, index) => <span key={index} />)}<div className="motion-existing-appointment"><strong>María Gómez</strong><span>09:00 · Limpieza</span></div><div className="motion-existing-appointment second"><strong>Sofía García</strong><span>09:30 · Control</span></div><div className="motion-new-appointment" style={{ opacity: saved ? range(time, 4.4, 4.8) : 0, transform: `scale(${.93 + range(time, 4.4, 4.8) * .07})` }}><strong>Carlos Sánchez</strong><span>10:30 · Control odontológico</span><Check size={17} /></div></div></div></div>
    <div className="motion-appointment-form motion-white-card" style={{ opacity: form, transform: `translateY(${(1 - form) * -15}px)` }}><div><h3>Nuevo turno</h3><span>+</span></div><label>Paciente<span className={time > 1 ? 'motion-field-active' : ''}>{name || 'Buscar paciente…'}<span className="motion-input-caret" style={{ opacity: time > 1 && time < 2 ? 1 : 0 }} /></span></label><div className="motion-form-row"><label>Profesional<span>Lucas Díaz <ChevronDown size={14} /></span></label><label>Horario<span className={time > 2.8 ? 'motion-field-active' : ''}>{time > 2.8 ? '10:30' : 'Seleccionar'}<ChevronDown size={14} /></span></label></div><label>Servicio<span>Control odontológico <ChevronDown size={14} /></span></label><div className="motion-primary-button">Guardar turno <ArrowRight size={17} /></div></div>
    <Cursor time={time} stops={[[0,960,680],[1,723,337],[2,742,337],[2.8,852,420],[4.2,755,578],[5,950,660]]} />
    <Toast visible={saved ? range(time, 4.6, 5) : 0} title="Carlos ya está en la agenda." text="El turno queda disponible para todo tu equipo." />
  </>
}

function Patient({ time }: { time: number }) {
  const chart = range(time, 2.7, 3.05), saved = time > 5.1
  return <>
    <div className="motion-patient-card motion-white-card"><div className="motion-patient-heading"><span className="motion-avatar">CS</span><div><small>FICHA DEL PACIENTE</small><h3>Carlos Sánchez</h3></div><span className="motion-patient-status">Paciente activo</span></div><div className="motion-patient-nav"><span>Información</span><span className={time > 1.1 && !chart ? 'active' : ''}>Historia clínica</span><span className={chart ? 'active' : ''}>Odontograma</span><span>Archivos</span></div><div className="motion-patient-note" style={{ opacity: 1 - chart }}><small>ÚLTIMA CONSULTA</small><h4>Control de seguimiento</h4><p>La evolución y los archivos del paciente,<br />en la misma ficha.</p><div><span>Historia clínica</span><span>Archivos adjuntos <Check size={14} /></span></div></div><div className="motion-dental-chart" style={{ opacity: chart }}><div><strong>Odontograma</strong><span>Registro por pieza</span></div><div className="motion-teeth">{['1.6','1.5','1.4','1.3','1.2','1.1','2.1','2.2'].map(tooth => <span key={tooth} className={tooth === '1.4' && time > 3.8 ? 'motion-tooth-selected' : ''}><img src={`/dientes/superior/${tooth}.png`} alt="" /><small>{tooth}</small><i /></span>)}</div><div className="motion-tooth-detail" style={{ opacity: range(time, 3.8, 4.1) }}><span><ProductIcon name="patient" size={25} /> Pieza 1.4</span><span>Registro clínico</span><strong>Guardar <Check size={15} /></strong></div></div></div>
    <Cursor time={time} stops={[[0,940,660],[1.1,456,268],[2.8,660,268],[3.8,389,434],[5.1,885,575],[6,978,660]]} />
    <Toast visible={saved ? range(time, 5.2, 5.6) : 0} title="Su historia, siempre a mano." text="Odontograma y evolución, conectados a su ficha." />
  </>
}

function Finance({ time }: { time: number }) {
  const saved = time > 4.2, amount = '45.000'.slice(0, Math.floor(range(time, 1, 2) * 6))
  return <>
    <div className="motion-finance-ledger motion-white-card"><small>CAJA DEL CONSULTORIO</small><h3>Los cobros, en orden.</h3><div className="motion-balance"><span>Ingresos registrados</span><strong>$ {saved ? '165.000' : '120.000'}</strong></div><div className="motion-ledger-row"><span className="motion-ledger-icon">↗</span><span>Control odontológico<small>María Gómez</small></span><strong>+ $ 35.000</strong></div><div className="motion-ledger-row" style={{ opacity: range(time, 4.4, 4.8) }}><span className="motion-ledger-icon">↗</span><span>Control odontológico<small>Carlos Sánchez</small></span><strong>+ $ 45.000</strong></div></div>
    <div className="motion-finance-form motion-white-card" style={{ opacity: 1 - range(time, 4.2, 4.6), transform: `translateY(${-range(time, 4.2, 4.6) * 16}px)` }}><div className="motion-finance-form-title"><span><ProductIcon name="finance" size={28} /></span><h3>Registrar ingreso</h3></div><label>Paciente<span>Carlos Sánchez</span></label><label>Importe<span className={time > 1 ? 'motion-field-active' : ''}><small>$</small>{amount || '0'}</span></label><label>Forma de pago<span className={time > 2.7 ? 'motion-field-active' : ''}>{time > 2.7 ? 'Transferencia' : 'Seleccionar'}<ChevronDown size={15} /></span></label><div className="motion-primary-button">Registrar ingreso <ArrowRight size={16} /></div></div>
    <Cursor time={time} stops={[[0,955,671],[1,754,403],[2,795,403],[2.7,776,480],[4.2,783,564],[5,942,660]]} />
    <Toast visible={saved ? range(time, 4.5, 4.9) : 0} title="Ingreso registrado." text="El movimiento ya forma parte de la caja." />
  </>
}

export function MotionScene({ variant, time }: { variant: ProductIconName; time: number }) {
  const reset = range(time, 7.4, 7.93)
  const action = (at: number) => variant === 'booking' ? <Booking time={at} /> : variant === 'agenda' ? <Agenda time={at} /> : variant === 'patient' ? <Patient time={at} /> : <Finance time={at} />
  return <div className={`motion-scene motion-scene-${variant}`}>
    <div className="motion-art-geometry" aria-hidden="true"><i /><i /><i /></div>
    <div className="motion-scene-brand"><BrandLogo className="motion-brand-logo" /><span><ProductIcon name={variant} size={20} />{variant === 'booking' ? 'Reservas online' : variant === 'agenda' ? 'Agenda del equipo' : variant === 'patient' ? 'Ficha clínica' : 'Caja y cobros'}</span></div>
    <div className="motion-scene-action" style={{ opacity: 1 - reset }}>{action(time)}</div>
    {reset > 0 && <div className="motion-scene-action" style={{ opacity: reset }}>{action(0)}</div>}
  </div>
}

/** Export studio only: consumed by scripts/render-product-motion.mjs, not by the app. */
export function mountMotionStudio(element: HTMLElement, variant: ProductIconName) {
  const root = createRoot(element)
  const selectors: Record<ProductIconName, Array<[number, string]>> = {
    booking: [[1.5, '.motion-month-days>span:nth-child(12)'], [2.7, '.motion-times>span:nth-of-type(2)'], [4.2, '.motion-book-button']],
    agenda: [[1, '.motion-appointment-form>label:first-of-type>span'], [2.8, '.motion-form-row>label:nth-child(2)>span'], [4.2, '.motion-appointment-form>.motion-primary-button']],
    patient: [[1.1, '.motion-patient-nav>span:nth-child(2)'], [2.8, '.motion-patient-nav>span:nth-child(3)'], [3.8, '.motion-teeth>span:nth-child(3)'], [5.1, '.motion-tooth-detail>strong']],
    finance: [[1, '.motion-finance-form>label:nth-of-type(2)>span'], [2.7, '.motion-finance-form>label:nth-of-type(3)>span'], [4.2, '.motion-finance-form>.motion-primary-button']],
  }
  let targets: Array<[number, number, number]> | undefined
  return (time: number) => {
    flushSync(() => root.render(<MotionScene variant={variant} time={time} />))
    if (!targets) {
      const origin = element.getBoundingClientRect()
      targets = [[0, 990, 670], ...selectors[variant].map(([at, selector]): [number, number, number] => {
        const box = element.querySelector(selector)!.getBoundingClientRect()
        return [at, box.left - origin.left + box.width * .6, box.top - origin.top + box.height * .6]
      }), [6, 990, 670]]
    }
    const cursor = element.querySelector<SVGElement>('.motion-cursor')!
    let start = targets[0], end = targets[targets.length - 1]
    for (let index = 1; index < targets.length; index++) if (time <= targets[index][0]) { start = targets[index - 1]; end = targets[index]; break }
    const progress = range(time, start[0], end[0])
    cursor.style.left = `${start[1] + (end[1] - start[1]) * progress}px`
    cursor.style.top = `${start[2] + (end[2] - start[2]) * progress}px`
  }
}
