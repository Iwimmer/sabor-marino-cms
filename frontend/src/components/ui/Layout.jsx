// Piezas de diseño del panel: tarjetas, encabezados, estados vacíos, carga y error.
import { AlertTriangle, Inbox } from 'lucide-react';

export const Card = ({ className = '', children, ...props }) => (
  <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`} {...props}>{children}</section>
);

export const CardHeader = ({ title, description, actions }) => (
  <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div className="min-w-0">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);

export const PageHeader = ({ title, description, actions }) => (
  <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </header>
);

export const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    <div className="mb-3 rounded-full bg-primary-soft p-3 text-primary"><Icon className="size-6" aria-hidden /></div>
    <p className="font-medium text-slate-900">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center" role="alert">
    <AlertTriangle className="mb-2 size-7 text-amber-500" aria-hidden />
    <p className="font-medium text-slate-900">No se pudo cargar la información</p>
    <p className="mt-1 text-sm text-slate-500">{error?.message}</p>
    {onRetry && <button onClick={onRetry} className="mt-3 text-sm font-medium text-primary underline">Reintentar</button>}
  </div>
);

/** Filas grises animadas mientras carga (mejor que una pantalla en blanco) */
export const SkeletonRows = ({ rows = 4 }) => (
  <div className="space-y-3 p-4 sm:p-6" aria-busy="true" aria-label="Cargando">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton h-12" />)}
  </div>
);

const BADGES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  blue: 'bg-primary-soft text-primary ring-primary/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
};
export const Badge = ({ color = 'gray', children }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGES[color]}`}>{children}</span>
);
