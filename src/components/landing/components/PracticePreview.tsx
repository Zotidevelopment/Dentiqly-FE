import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { BrandLogo } from "../../brand/BrandLogo";

export function PracticePreview({
  view,
}: {
  view: "agenda" | "patient" | "finance";
}) {
  return (
    <div
      className="lp-app"
      aria-label={`Vista ilustrativa de ${view === "agenda" ? "la agenda" : view === "patient" ? "la ficha de un paciente" : "las finanzas"}`}
    >
      <aside className="lp-app-sidebar" aria-hidden="true">
        <span className="lp-app-monogram"><BrandLogo variant="mark" tone="inverse" className="h-6 w-auto" alt="" /></span>
        <LayoutDashboard size={17} />
        <span className={view === "agenda" ? "is-active" : ""}>
          <CalendarDays size={17} />
        </span>
        <span className={view === "patient" ? "is-active" : ""}>
          <Users size={17} />
        </span>
        <FileText size={17} />
        <span className={view === "finance" ? "is-active" : ""}>
          <Wallet size={17} />
        </span>
        <span className="lp-app-avatar">CM</span>
      </aside>
      <div className="lp-app-main">
        <div className="lp-app-topbar">
          <span>
            Mi consultorio <ChevronRight size={11} />{" "}
            {view === "agenda"
              ? "Agenda"
              : view === "patient"
                ? "Pacientes"
                : "Finanzas"}
          </span>
          <span className="lp-app-user">CM</span>
        </div>
        {view === "agenda" ? (
          <Agenda />
        ) : view === "patient" ? (
          <Patient />
        ) : (
          <Finance />
        )}
      </div>
    </div>
  );
}

function Agenda() {
  const appointments = [
    {
      name: "Lucía Martínez",
      treatment: "Control · 30 min",
      column: 0,
      row: 0,
      status: "blue",
    },
    {
      name: "Martín López",
      treatment: "Limpieza · 45 min",
      column: 1,
      row: 1,
      status: "mint",
    },
    {
      name: "Sofía García",
      treatment: "Primera consulta",
      column: 2,
      row: 0,
      status: "peach",
    },
    {
      name: "Pedro Ruiz",
      treatment: "Restauración · 60 min",
      column: 0,
      row: 2,
      status: "peach",
    },
    {
      name: "Ana Fernández",
      treatment: "Control · 30 min",
      column: 2,
      row: 2,
      status: "blue",
    },
    {
      name: "Carolina Díaz",
      treatment: "Ortodoncia · 45 min",
      column: 1,
      row: 3,
      status: "blue",
    },
    {
      name: "Tomás Pérez",
      treatment: "Control · 30 min",
      column: 2,
      row: 4,
      status: "mint",
    },
  ];
  return (
    <div className="lp-agenda">
      <div className="lp-app-title">
        <div>
          <span className="lp-app-kicker">TODO LISTO PARA HOY</span>
          <h3>Tu agenda</h3>
        </div>
        <span className="lp-app-add">
          <Plus size={12} /> Nuevo turno
        </span>
      </div>
      <div className="lp-agenda-toolbar">
        <strong>12 – 16 de mayo</strong>
        <span>
          <ChevronLeft size={13} /> Hoy <ChevronRight size={13} />
        </span>
        <span className="lp-app-view">Semana</span>
      </div>
      <div className="lp-calendar">
        <div className="lp-calendar-days">
          <span />
          <span>
            LUN<strong>12</strong>
          </span>
          <span className="lp-calendar-today">
            MAR<strong>13</strong>
          </span>
          <span>
            MIÉ<strong>14</strong>
          </span>
        </div>
        <div className="lp-calendar-grid">
          <div className="lp-calendar-hours">
            {["09:00", "09:30", "10:00", "10:30", "11:00"].map((time) => (
              <span key={time}>{time}</span>
            ))}
          </div>
          <div className="lp-calendar-slots">
            {Array.from({ length: 15 }, (_, i) => (
              <span
                key={i}
                className="lp-calendar-slot"
                style={{
                  gridColumn: (i % 3) + 1,
                  gridRow: Math.floor(i / 3) + 1,
                }}
              />
            ))}
            {appointments.map((appointment) => (
              <div
                key={appointment.name}
                className={`lp-appointment lp-appointment-${appointment.status}`}
                style={{
                  gridColumn: appointment.column + 1,
                  gridRow: appointment.row + 1,
                }}
              >
                <strong>{appointment.name}</strong>
                <span>{appointment.treatment}</span>
              </div>
            ))}
            <div className="lp-calendar-now">
              <span />
              10:15
            </div>
          </div>
        </div>
      </div>
      <div className="lp-app-status">
        <span>
          <i /> Agenda compartida con tu equipo
        </span>
        <Check size={12} />
      </div>
    </div>
  );
}

function Patient() {
  const teeth = [
    "1.6",
    "1.5",
    "1.4",
    "1.3",
    "1.2",
    "1.1",
    "2.1",
    "2.2",
    "2.3",
    "2.4",
    "2.5",
    "2.6",
  ];
  return (
    <div className="lp-patient">
      <div className="lp-app-title">
        <h3>Ficha del paciente</h3>
        <Search size={16} />
      </div>
      <div className="lp-patient-identity">
        <span>LM</span>
        <div>
          <h4>Lucía Martínez</h4>
          <p>Paciente · Historia clínica</p>
        </div>
        <span className="lp-patient-badge">Activa</span>
      </div>
      <div className="lp-patient-tabs">
        <strong>Odontograma</strong>
        <span>Historia clínica</span>
        <span>Archivos</span>
      </div>
      <div className="lp-odontogram">
        <span className="lp-app-kicker">REGISTRO POR PIEZA DENTAL</span>
        <div>
          {teeth.map((tooth, i) => (
            <span key={tooth}>
              <img
                src={`/dientes/superior/${tooth}.png`}
                alt={`Pieza ${tooth}`}
                width="25"
                height="58"
                loading="lazy"
                className={i === 3 || i === 9 ? "lp-tooth-treated" : ""}
              />
              <small>{tooth}</small>
            </span>
          ))}
        </div>
        <p>
          <i />
          Sano <i />
          Tratamiento registrado
        </p>
      </div>
      <div className="lp-clinical-note">
        <span>
          <FileText size={14} /> Última evolución
        </span>
        <strong>Control y seguimiento</strong>
        <p>Evaluación clínica registrada. Próximo control agendado.</p>
      </div>
      <div className="lp-app-status">
        <span>
          <Check size={12} /> Información del paciente en un solo lugar
        </span>
      </div>
    </div>
  );
}

function Finance() {
  return (
    <div className="lp-finance">
      <div className="lp-app-title">
        <div>
          <span className="lp-app-kicker">LA CLÍNICA, EN NÚMEROS</span>
          <h3>Resumen de caja</h3>
        </div>
        <span className="lp-app-view">Este mes</span>
      </div>
      <div className="lp-finance-totals">
        <div>
          <span>Ingresos registrados</span>
          <strong>$ 480.000</strong>
          <small>
            <ArrowDownLeft size={12} /> Cobros del período
          </small>
        </div>
        <div>
          <span>Saldo pendiente</span>
          <strong>$ 85.000</strong>
          <small>Cuenta corriente de pacientes</small>
        </div>
      </div>
      <div className="lp-chart">
        <div>
          <strong>Movimiento de ingresos</strong>
          <span>Datos de ejemplo</span>
        </div>
        <div className="lp-bars">
          {[38, 62, 46, 81, 57, 94, 72, 100, 85, 67, 91, 78].map(
            (height, i) => (
              <span key={i} style={{ height: `${height}%` }} />
            ),
          )}
        </div>
        <div className="lp-chart-legend">
          <span>Inicio del mes</span>
          <span>Fin del mes</span>
        </div>
      </div>
      <div className="lp-finance-transaction">
        <span className="lp-transaction-icon">
          <ArrowUpRight size={16} />
        </span>
        <div>
          <strong>Liquidación de profesionales</strong>
          <span>Consultá los honorarios de tu equipo.</span>
        </div>
        <ChevronRight size={15} />
      </div>
    </div>
  );
}
