'use client';
// IMÁGENES: biblioteca de medios. Se puede arrastrar fotos a la zona punteada.
// Cada imagen muestra cuánto pesa cada una de sus 3 versiones (generadas por sharp).
import { useRef, useState } from 'react';
import { Upload, Trash2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { Button, Card, PageHeader, Modal, Field, Input, EmptyState, SkeletonRows, ErrorState, useConfirm } from '@/components/ui';
import { thumbOf, useUpload } from '@/components/admin/ImagePicker';

const kb = (b) => `${Math.max(1, Math.round(b / 1024))} KB`;
const SIZE_NAMES = { sm: 'Celular', md: 'Tablet', lg: 'Escritorio' };

function MediaDetail({ media, onClose, onSaved, onDeleted }) {
  const [alt, setAlt] = useState(media?.alt ?? '');
  const confirm = useConfirm();
  if (!media) return null;
  const save = async () => { onSaved(await api.put(`/media/${media.id}`, { alt })); toast.success('Descripción guardada'); onClose(); };
  const remove = async () => {
    if (!(await confirm({ title: '¿Eliminar esta imagen?', message: 'Si un plato o bloque la usa, quedará sin imagen.' }))) return;
    await api.del(`/media/${media.id}`);
    toast.success('Imagen eliminada');
    onDeleted(media.id);
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={media.originalName} size="lg"
      footer={<><Button variant="ghost" onClick={remove} className="text-red-600 sm:mr-auto"><Trash2 className="size-4" /> Eliminar</Button><Button variant="secondary" onClick={onClose}>Cerrar</Button><Button onClick={save}>Guardar</Button></>}>
      <div className="grid gap-5 md:grid-cols-2">
        <img src={media.url} alt={media.alt} className="w-full rounded-lg bg-slate-100 object-contain" />
        <div className="space-y-4">
          <Field label="Descripción (texto alternativo)" hint="Ayuda a personas con lectores de pantalla y a Google.">
            {({ id }) => <Input id={id} value={alt} onChange={(e) => setAlt(e.target.value)} />}
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Versiones optimizadas (WebP)</p>
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
              {media.variants.map((v) => (
                <li key={v.size} className="flex justify-between gap-2 px-3 py-2">
                  <span className="text-slate-600">{SIZE_NAMES[v.size]} <span className="text-slate-400">· {v.width}×{v.height}</span></span>
                  <a href={v.url} target="_blank" rel="noreferrer" className="font-medium text-primary tabular-nums">{kb(v.bytes)}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function MediosPage() {
  const { data, loading, error, reload, setData } = useApi('/media');
  const [selected, setSelected] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const input = useRef(null);
  const { upload, uploading } = useUpload(() => reload());

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
    if (files.length) upload(files);
  };

  return (
    <>
      <PageHeader title="Imágenes" description="Sube fotos de tus platos y del local. Se optimizan solas en 3 tamaños para que la web cargue rápido."
        actions={<Button onClick={() => input.current.click()} loading={uploading}><Upload className="size-4" /> Subir imágenes</Button>} />
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { upload([...e.target.files]); e.target.value = ''; }} />

      <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop}
        className={`mb-6 hidden rounded-xl border-2 border-dashed p-6 text-center text-sm transition md:block ${dragOver ? 'border-primary bg-primary-soft text-primary' : 'border-slate-300 text-slate-500'}`}>
        <ImagePlus className="mx-auto mb-2 size-6" /> Arrastra tus fotos aquí (JPG, PNG o WebP, máximo 8 MB)
      </div>

      <Card>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <SkeletonRows /> : !data.length ? (
          <EmptyState icon={ImagePlus} title="Tu biblioteca está vacía" description="Sube la primera foto de tu restaurante." action={<Button onClick={() => input.current.click()}>Subir imagen</Button>} />
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-4 xl:grid-cols-5">
            {data.map((m) => (
              <li key={m.id}>
                <button onClick={() => setSelected(m)} className="group block w-full text-left">
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <img src={thumbOf(m)} alt={m.alt} loading="lazy" className="size-full object-cover transition group-hover:scale-105" />
                  </div>
                  <p className="mt-1.5 truncate text-xs font-medium text-slate-700">{m.alt || m.originalName}</p>
                  <p className="text-xs text-slate-400">{m.variants.map((v) => kb(v.bytes)).join(' · ')}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selected && <MediaDetail key={selected.id} media={selected} onClose={() => setSelected(null)}
        onSaved={(m) => setData(data.map((x) => (x.id === m.id ? m : x)))}
        onDeleted={(id) => setData(data.filter((x) => x.id !== id))} />}
    </>
  );
}
