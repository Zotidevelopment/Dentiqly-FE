import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { AlertTriangle, CalendarClock, CheckCircle2, CreditCard, Loader2, RefreshCw, X } from "lucide-react"
import { apiClient } from "../../lib/api-client"
import { useToast } from "../../hooks/use-toast"

/**
 * Pestaña "Plan y facturación" de Datos de la clínica: estado del plan,
 * próxima renovación y cancelación de la suscripción.
 */

interface EstadoPlan {
  subscription_status: "pending_payment" | "trialing" | "active" | "past_due" | "suspended" | "cancelled"
  billing_plan?: "monthly" | "annual"
  billing_cycle_end?: string | null
  trial_ends_at?: string | null
  grace_period_ends_at?: string | null
  cancel_at_period_end?: boolean
  payment_provider?: "mercadopago" | "lemonsqueezy" | null
}

const fecha = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) : "fin del período pago"

const MOTIVOS = ["Es caro para mí", "No lo estoy usando", "Me falta alguna función", "Cierro o pauso el consultorio", "Uso otro sistema", "Otro motivo"]

const irAActivar = () => {
  const url = new URL(window.location.href)
  url.searchParams.set("activate", "true")
  window.location.assign(url.pathname + url.search)
}

export const PlanSuscripcion: React.FC = () => {
  const { toast } = useToast()
  const [estado, setEstado] = useState<EstadoPlan | null>(null)
  const [error, setError] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [cancelando, setCancelando] = useState(false)

  const cargar = () =>
    apiClient
      .get<EstadoPlan>("/billing/status")
      .then((r) => { setEstado(r); setError(false) })
      .catch(() => setError(true))

  useEffect(() => {
    cargar()
  }, [])

  const cancelar = async () => {
    setCancelando(true)
    try {
      await apiClient.post("/billing/cancel", { motivo })
      setConfirmando(false)
      toast({ title: "Cancelaste la renovación", description: `Tu plan sigue activo hasta el ${fecha(estado?.billing_cycle_end)}. No se te va a cobrar de nuevo.` })
      await cargar()
    } catch (e) {
      toast({ variant: "destructive", title: "No se pudo cancelar", description: e instanceof Error ? e.message : "Probá de nuevo." })
    } finally {
      setCancelando(false)
    }
  }

  if (error) return <p className="p-8 text-[14px] text-red-700">No pudimos cargar tu plan. Recargá la página.</p>
  if (!estado) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 size={22} className="animate-spin text-[#2458ED]" />
      </div>
    )
  }

  const { subscription_status: s } = estado
  const nombrePlan = estado.billing_plan === "annual" ? "Plan Pro anual" : "Plan Pro mensual"
  const medio = estado.payment_provider === "lemonsqueezy" ? "tarjeta" : estado.payment_provider === "mercadopago" ? "MercadoPago" : null
  const activo = s === "active" || s === "past_due"
  const canceladoAFinDePeriodo = activo && estado.cancel_at_period_end

  return (
    <div className="p-6 sm:p-8">
      {/* Resumen del plan */}
      <div className="flex flex-col gap-5 rounded-[20px] bg-[#0B2440] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-[12.5px] font-semibold text-[#8FB2FF]">Tu plan</p>
          <h3 className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">
            {s === "trialing" ? "Prueba gratis" : activo ? nombrePlan : "Sin plan activo"}
          </h3>
          <p className="mt-1.5 flex items-center gap-2 text-[14px] text-white/70">
            <CalendarClock size={15} />
            {s === "trialing" && <>Tu prueba termina el {fecha(estado.trial_ends_at)}</>}
            {/* Sin proveedor: pagó con el pago único viejo, que no se renueva solo. */}
            {activo && !canceladoAFinDePeriodo && (medio
              ? <>Se renueva solo el {fecha(estado.billing_cycle_end)} · {medio}</>
              : <>Pagado hasta el {fecha(estado.billing_cycle_end)}</>)}
            {canceladoAFinDePeriodo && <>Activo hasta el {fecha(estado.billing_cycle_end)} · no se renueva</>}
            {!activo && s !== "trialing" && <>Activá un plan para volver a usar el panel</>}
          </p>
        </div>
        {(s === "trialing" || !activo || canceladoAFinDePeriodo) && (
          <button type="button" onClick={irAActivar}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2458ED] px-5 py-3 text-[14.5px] font-semibold text-white hover:bg-[#3A6BFF]">
            {canceladoAFinDePeriodo ? <><RefreshCw size={16} /> Volver a suscribirme</> : <><CreditCard size={16} /> Activar plan</>}
          </button>
        )}
      </div>

      {s === "past_due" && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-[13.5px] text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          No pudimos cobrar la última renovación. Tenés acceso hasta el {fecha(estado.grace_period_ends_at)}: revisá {estado.payment_provider === "mercadopago" ? "tu medio de pago en MercadoPago" : "que tu tarjeta tenga saldo y esté habilitada para compras en dólares"}.
        </p>
      )}

      {canceladoAFinDePeriodo && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#F5F8FF] px-4 py-3 text-[13.5px] text-[#53677E]">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#2458ED]" />
          Cancelaste la renovación. Hasta el {fecha(estado.billing_cycle_end)} seguís usando todo normalmente y no se te va a cobrar más. Tus datos quedan guardados por si volvés.
        </p>
      )}

      {/* Cancelar */}
      {activo && !canceladoAFinDePeriodo && (
        <div className="mt-8 border-t border-[#EEF2F7] pt-6">
          <h4 className="text-[15px] font-semibold text-[#0B2440]">Cancelar suscripción</h4>
          <p className="mt-1 max-w-xl text-[13.5px] leading-relaxed text-[#65788D]">
            Dejamos de cobrarte desde la próxima renovación. Seguís usando Dentiqly hasta el {fecha(estado.billing_cycle_end)} y tus datos quedan guardados.
          </p>
          <button type="button" onClick={() => setConfirmando(true)}
            className="mt-4 rounded-xl border border-red-200 px-4 py-2.5 text-[14px] font-semibold text-red-700 hover:bg-red-50">
            Cancelar mi suscripción
          </button>
        </div>
      )}

      {confirmando && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B2440]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cancelar-titulo">
          <div className="w-full max-w-[440px] rounded-[22px] bg-white p-6 shadow-[0_30px_60px_-20px_#0B244066] sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <h2 id="cancelar-titulo" className="text-[20px] font-semibold tracking-[-0.02em] text-[#0B2440]">¿Seguro que querés cancelar?</h2>
              <button type="button" onClick={() => setConfirmando(false)} aria-label="Cerrar" className="-mr-1 rounded-lg p-1.5 text-[#93A3B8] hover:bg-[#F5F8FF]"><X size={18} /></button>
            </div>
            <ul className="mt-4 space-y-2 text-[14px] text-[#53677E]">
              <li>• No se te va a cobrar más.</li>
              <li>• Seguís usando todo hasta el <b className="text-[#0B2440]">{fecha(estado.billing_cycle_end)}</b>.</li>
              <li>• Tus pacientes, turnos e historias clínicas quedan guardados.</li>
            </ul>
            <label htmlFor="cancelar-motivo" className="mt-5 block text-[13px] font-semibold text-[#0B2440]">¿Nos contás por qué? <span className="font-normal text-[#93A3B8]">(opcional)</span></label>
            <select id="cancelar-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#DCE5EE] bg-white px-3.5 py-2.5 text-[14px] text-[#0B2440] focus:border-[#2458ED] focus:outline-none">
              <option value="">Elegí un motivo</option>
              {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmando(false)} className="rounded-xl bg-[#2458ED] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#1744CD]">
                Seguir con mi plan
              </button>
              <button type="button" onClick={cancelar} disabled={cancelando}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">
                {cancelando && <Loader2 size={15} className="animate-spin" />} Sí, cancelar
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
