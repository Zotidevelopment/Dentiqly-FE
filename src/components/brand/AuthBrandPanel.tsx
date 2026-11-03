import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, FileText, Wallet } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface AuthBrandPanelProps {
  title: ReactNode;
  description: ReactNode;
}

export function AuthBrandPanel({ title, description }: AuthBrandPanelProps) {
  return (
    <aside className="dentiqly-auth-panel hidden lg:flex">
      <div className="dentiqly-brand-pattern" aria-hidden="true" />
      <Link
        to="/"
        aria-label="Dentiqly, inicio"
        className="relative z-10 self-start"
      >
        <BrandLogo className="h-10 w-auto" />
      </Link>
      <div className="relative z-10 my-12 max-w-md">
        <p className="dentiqly-auth-eyebrow">Tu consultorio, conectado</p>
        <h2>{title}</h2>
        <p className="dentiqly-auth-description">{description}</p>
      </div>
      <div className="dentiqly-auth-summary relative z-10">
        {[
          {
            icon: CalendarDays,
            title: "Una agenda compartida",
            text: "Cada turno, en su lugar.",
          },
          {
            icon: FileText,
            title: "La historia completa",
            text: "Cada paciente, con su información.",
          },
          {
            icon: Wallet,
            title: "Los números, claros",
            text: "Cada cobro, registrado.",
          },
        ].map(({ icon: Icon, title: itemTitle, text }) => (
          <div key={itemTitle}>
            <span>
              <Icon size={19} strokeWidth={1.6} />
            </span>
            <div>
              <strong>{itemTitle}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="relative z-10 mt-8 text-xs text-slate-500">
        De la primera reserva al último cobro del día.
      </p>
    </aside>
  );
}
