'use client';
// Selector de imágenes reutilizable: muestra la biblioteca de medios en un modal,
// permite subir una nueva (la API la optimiza con sharp) y devuelve el id elegido.
import { useRef, useState } from 'react';
import { ImagePlus, Upload, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { Button, Modal, EmptyState, SkeletonRows } from '@/components/ui';

export const thumbOf = (media) => media?.variants?.find((v) => v.size === 'sm')?.url ?? media?.url;

export function useUpload(onDone) {
  const [uploading, setUploading] = useState(false);
  const upload = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        form.append('alt', file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
        const media = await api.post('/media', form);
        const saved = Math.round((1 - media.variants.at(-1).bytes / file.size) * 100);
        toast.success(`"${file.name}" subida`, { description: saved > 0 ? `Optimizada: ${saved}% más liviana en su versión grande` : 'Optimizada en 3 tamaños' });
        onDone?.(media);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };
  return { upload, uploading };
}

export function MediaLibraryModal({ open, onClose, onSelect, multiple = false, initial = [] }) {
  const { data, loading, reload } = useApi(open ? '/media' : null);
  const [selected, setSelected] = useState(initial);
  const input = useRef(null);
  const { upload, uploading } = useUpload((m) => { reload(); setSelected((s) => (multiple ? [...s, m.id] : [m.id])); });

  const toggle = (id) => setSelected((s) => (multiple ? (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]) : [id]));

  return (
    <Modal open={open} onClose={onClose} size="lg" title={multiple ? 'Elegir imágenes' : 'Elegir imagen'}
      description="Sube una foto nueva o elige una de la biblioteca."
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={() => { onSelect(multiple ? selected : selected[0] ?? null); onClose(); }} disabled={!multiple && !selected.length}>
          {multiple ? `Usar ${selected.length} imagen(es)` : 'Usar imagen'}
        </Button>
      </>}>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { upload([...e.target.files]); e.target.value = ''; }} />
      <Button variant="secondary" loading={uploading} onClick={() => input.current.click()} className="mb-4 w-full sm:w-auto">
        <Upload className="size-4" /> Subir desde mi equipo
      </Button>
      {loading && !data ? <SkeletonRows rows={2} /> : !data?.length ? (
        <EmptyState icon={ImagePlus} title="Aún no hay imágenes" description="Sube tu primera foto con el botón de arriba." />
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {data.map((m) => {
            const isSel = selected.includes(m.id);
            return (
              <li key={m.id}>
                <button type="button" onClick={() => toggle(m.id)} aria-pressed={isSel}
                  className={`relative block aspect-square w-full overflow-hidden rounded-lg ring-2 transition ${isSel ? 'ring-primary' : 'ring-transparent hover:ring-slate-300'}`}>
                  <img src={thumbOf(m)} alt={m.alt} className="size-full object-cover" loading="lazy" />
                  {isSel && <span className="absolute top-1.5 right-1.5 rounded-full bg-primary p-1 text-on-primary"><Check className="size-3.5" /></span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}

/** Campo de formulario para UNA imagen: miniatura + botones Cambiar / Quitar */
export function ImageField({ value, onChange, mediaMap, label = 'Imagen' }) {
  const [open, setOpen] = useState(false);
  const { data } = useApi(value && !mediaMap?.get(value) ? `/media/${value}` : null);
  const media = mediaMap?.get(value) ?? data;

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value && media ? <img src={thumbOf(media)} alt={media.alt} className="size-full object-cover" /> : <ImagePlus className="size-6 text-slate-300" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>{value ? 'Cambiar' : 'Elegir imagen'}</Button>
          {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}><X className="size-4" /> Quitar</Button>}
        </div>
      </div>
      <MediaLibraryModal open={open} onClose={() => setOpen(false)} onSelect={onChange} initial={value ? [value] : []} />
    </div>
  );
}
