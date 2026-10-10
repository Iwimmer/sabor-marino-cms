'use client';
// Ventana modal accesible: se cierra con Escape o tocando el fondo,
// bloquea el scroll de la página y en celular aparece desde abajo (más cómodo con el pulgar).
import { useEffect, useRef, useState, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('input, textarea, select, button')?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-3xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div ref={panel} className={`relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${width}`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button onClick={onClose} className="-m-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

// ---------- Confirmación antes de acciones destructivas ----------
// const confirm = useConfirm();  if (await confirm({ title: '¿Eliminar?' })) { ... }
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const confirm = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), []);
  const close = (value) => { state?.resolve(value); setState(null); };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={!!state} onClose={() => close(false)} size="sm"
        title={state?.title ?? '¿Estás seguro?'}
        footer={<>
          <Button variant="secondary" onClick={() => close(false)}>Cancelar</Button>
          <Button variant={state?.danger === false ? 'primary' : 'danger'} onClick={() => close(true)}>{state?.confirmText ?? 'Eliminar'}</Button>
        </>}
      >
        <p className="text-sm text-slate-600">{state?.message ?? 'Esta acción no se puede deshacer.'}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
