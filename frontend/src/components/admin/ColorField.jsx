'use client';
// Campo de color: muestra la muestra, permite escribir el HEX o elegir con el selector visual.
import { useEffect, useRef, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

const HEX = /^#[0-9A-Fa-f]{6}$/;

export default function ColorField({ label, hint, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const box = useRef(null);

  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (!open) return;
    const close = (e) => !box.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const onText = (v) => {
    const hex = v.startsWith('#') ? v : `#${v}`;
    setText(hex);
    if (HEX.test(hex)) onChange(hex.toUpperCase());
  };

  return (
    <div ref={box} className="relative">
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setOpen(!open)} aria-label={`Elegir ${label}`}
          className="size-11 shrink-0 rounded-lg border border-slate-300 shadow-inner sm:size-10" style={{ background: value }} />
        <input value={text} onChange={(e) => onText(e.target.value)} maxLength={7} spellCheck={false}
          aria-label={`${label} en HEX`}
          className={`h-11 w-full min-w-0 rounded-lg border px-3 font-mono text-sm uppercase sm:h-10 ${HEX.test(text) ? 'border-slate-300' : 'border-red-400'}`} />
      </div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {open && (
        <div className="absolute top-full left-0 z-20 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
          <HexColorPicker color={value} onChange={(c) => onChange(c.toUpperCase())} />
        </div>
      )}
    </div>
  );
}
