'use client';
// Botón reutilizable. Altura mínima de 44px en celular (área táctil cómoda, WCAG).
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-primary text-on-primary hover:bg-primary-dark shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  accent: 'bg-accent text-on-accent hover:brightness-95 shadow-sm',
};
const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2 sm:h-10',
  icon: 'h-11 w-11 sm:h-10 sm:w-10 justify-center',
};

export function Button({ variant = 'primary', size = 'md', loading = false, href, className = '', children, disabled, ...props }) {
  const classes = `inline-flex items-center justify-center rounded-lg font-medium transition-colors
    disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (href) return <Link href={href} className={classes} {...props}>{children}</Link>;
  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
