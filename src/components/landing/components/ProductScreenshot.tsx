import { useEffect, useId, useRef, useState } from "react";
import { Download, Expand, X } from "lucide-react";

export type ProductView =
  | "dashboard"
  | "agenda"
  | "patient"
  | "odontogram"
  | "finance";

export const productScreenshots: Record<
  ProductView,
  { file: string; title: string; alt: string }
> = {
  dashboard: {
    file: "dashboard",
    title: "Panel principal",
    alt: "Captura del dashboard de Dentiqly con indicadores, lista de pacientes y agenda del día",
  },
  agenda: {
    file: "calendar",
    title: "Agenda semanal",
    alt: "Captura real de la agenda semanal de Dentiqly con turnos y horarios por día",
  },
  patient: {
    file: "patient",
    title: "Ficha del paciente",
    alt: "Captura real de la ficha de un paciente de demostración con datos personales, contacto y cobertura",
  },
  odontogram: {
    file: "odontogram",
    title: "Odontograma digital",
    alt: "Captura real del visor de odontogramas de Dentiqly con el registro por pieza dental",
  },
  finance: {
    file: "finance",
    title: "Flujo de caja",
    alt: "Captura real de la caja de Dentiqly con ingresos, egresos y movimientos registrados",
  },
};

export function ProductScreenshot({
  view,
  priority = false,
  compact = false,
}: {
  view: ProductView;
  priority?: boolean;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const screenshot = productScreenshots[view];
  const base = `/assets/screenshots/product-${screenshot.file}-v3`;

  useEffect(() => {
    if (!expanded) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  return (
    <>
      <button
        className={compact ? "lp-capture-link" : "lp-capture"}
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`Ampliar captura: ${screenshot.title}`}
        aria-haspopup="dialog"
      >
        {!compact && <img
          src={`${base}-detail.webp`}
          alt={screenshot.alt}
          width={1280}
          height={view === "odontogram" ? 854 : 876}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />}
        <span className={compact ? "" : "lp-capture-expand"}>
          <Expand size={14} />
          {compact ? "Ver pantalla real" : "Ampliar captura"}
        </span>
      </button>
      <dialog
        ref={dialog}
        className="lp-capture-dialog"
        aria-labelledby={titleId}
        onCancel={() => setExpanded(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setExpanded(false);
        }}
      >
        <div className="lp-capture-dialog-content">
          <div className="lp-capture-dialog-header">
            <div>
              <h3 id={titleId}>{screenshot.title}</h3>
              <p>Pantalla real de Dentiqly · Datos de demostración</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Cerrar captura"
            >
              <X size={21} />
            </button>
          </div>
          <div className="lp-capture-dialog-image">
            {expanded && <img
              src={`${base}.webp`}
              alt={screenshot.alt}
              width={1920}
              height={1080}
            />}
          </div>
          <div className="lp-capture-dialog-footer">
            <span>Podés desplazarte para ver todos los detalles.</span>
            <a href={`${base}.png`} download>
              <Download size={15} />
              Descargar PNG
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}
