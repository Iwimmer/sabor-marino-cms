'use client';
// Campos de formulario con etiqueta visible, ayuda y mensaje de error.
import { useId } from 'react';

const base = 'w-full rounded-lg border bg-white px-3 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30';
const ok = 'border-slate-300 focus:border-primary';
const bad = 'border-red-400 focus:border-red-500 focus:ring-red-200';

export function Field({ label, hint, error, children, required, className = '' }) {
  const id = useId();
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {typeof children === 'function' ? children({ id, invalid: !!error }) : children}
      {error ? <p className="text-sm text-red-600">{error}</p> : hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export const Input = ({ invalid, className = '', ...props }) => (
  <input className={`${base} h-11 sm:h-10 ${invalid ? bad : ok} ${className}`} {...props} />
);

export const Textarea = ({ invalid, className = '', rows = 4, ...props }) => (
  <textarea rows={rows} className={`${base} py-2 ${invalid ? bad : ok} ${className}`} {...props} />
);

export const Select = ({ invalid, className = '', children, ...props }) => (
  <select className={`${base} h-11 sm:h-10 pr-8 ${invalid ? bad : ok} ${className}`} {...props}>{children}</select>
);

/** Interruptor accesible (role="switch") */
export function Switch({ checked, onChange, label, description, disabled }) {
  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <button
        type="button" role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}
