'use client';
// FORMULARIOS DE CADA TIPO DE BLOQUE.
// Cada formulario edita el objeto "content" (el JSON que se guarda en page_components).
// "errors" viene de la API con claves como "content.items.0.name".
import { useState } from 'react';
import { Plus, Trash2, Star, ImagePlus, X } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { Button, Field, Input, Textarea, Select, Switch } from '@/components/ui';
import { ImageField, MediaLibraryModal, thumbOf } from './ImagePicker';
import {
  LayoutTemplate, UtensilsCrossed, Images, MessageSquareQuote, Clock, MapPin, AlignLeft,
} from 'lucide-react';

export const BLOCK_META = {
  hero: { label: 'Portada', icon: LayoutTemplate },
  menu: { label: 'Carta', icon: UtensilsCrossed },
  gallery: { label: 'Galería', icon: Images },
  testimonials: { label: 'Testimonios', icon: MessageSquareQuote },
  schedule: { label: 'Horario', icon: Clock },
  contact: { label: 'Contacto', icon: MapPin },
  text: { label: 'Texto con imagen', icon: AlignLeft },
};

/** Resumen corto para mostrar el bloque cerrado */
export function blockSummary(b) {
  const c = b.content;
  switch (b.type) {
    case 'gallery': return `${c.title || 'Galería'} · ${c.imageIds.length} imagen(es)`;
    case 'testimonials': return `${c.title} · ${c.items.length} testimonio(s)`;
    case 'schedule': return `${c.title} · ${c.items.length} horario(s)`;
    case 'menu': return `${c.title} · ${c.onlyFeatured ? 'solo destacados' : c.categoryIds.length ? `${c.categoryIds.length} categoría(s)` : 'todas las categorías'}`;
    default: return c.title || c.body?.slice(0, 60) || '';
  }
}

// Ayudantes para editar el contenido
const useEditor = (content, onChange, errors) => ({
  set: (key) => (e) => onChange({ ...content, [key]: e?.target ? e.target.value : e }),
  err: (path) => errors[`content.${path}`],
});

function ListEditor({ items, onChange, empty, newItem, render, addLabel }) {
  const update = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-3">
      {!items.length && <p className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">{empty}</p>}
      {items.map((it, i) => (
        <div key={i} className="relative rounded-lg border border-slate-200 bg-slate-50/60 p-3 pr-12">
          {render(it, (patch) => update(i, patch), i)}
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="Quitar"
            className="absolute top-2 right-2 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, newItem])}><Plus className="size-4" /> {addLabel}</Button>
    </div>
  );
}

function HeroForm({ content, onChange, errors }) {
  const { set, err } = useEditor(content, onChange, errors);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título" required error={err('title')} className="sm:col-span-2">{({ id, invalid }) => <Input id={id} invalid={invalid} value={content.title} onChange={set('title')} />}</Field>
      <Field label="Subtítulo" error={err('subtitle')} className="sm:col-span-2">{({ id }) => <Textarea id={id} rows={2} value={content.subtitle} onChange={set('subtitle')} />}</Field>
      <div className="sm:col-span-2"><ImageField label="Imagen de fondo" value={content.imageId} onChange={set('imageId')} /></div>
      <Field label="Texto del botón" hint="Déjalo vacío para no mostrar botón" error={err('buttonText')}>{({ id }) => <Input id={id} value={content.buttonText} onChange={set('buttonText')} />}</Field>
      <Field label="Enlace del botón" hint="/carta o https://..." error={err('buttonLink')}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={content.buttonLink} onChange={set('buttonLink')} />}</Field>
    </div>
  );
}

function MenuForm({ content, onChange, errors }) {
  const { set, err } = useEditor(content, onChange, errors);
  const { data: categories } = useApi('/categories');
  const toggleCat = (id) => onChange({ ...content, categoryIds: content.categoryIds.includes(id) ? content.categoryIds.filter((x) => x !== id) : [...content.categoryIds, id] });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título" required error={err('title')}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={content.title} onChange={set('title')} />}</Field>
      <Field label="Subtítulo" error={err('subtitle')}>{({ id }) => <Input id={id} value={content.subtitle} onChange={set('subtitle')} />}</Field>
      <div className="sm:col-span-2"><Switch checked={content.onlyFeatured} onChange={set('onlyFeatured')} label="Mostrar solo platos destacados" description="Ideal para la página de inicio" /></div>
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-medium text-slate-700">Categorías a mostrar <span className="font-normal text-slate-500">(ninguna marcada = todas)</span></legend>
        <div className="flex flex-wrap gap-2">
          {categories?.map((c) => {
            const on = content.categoryIds.includes(c.id);
            return <button type="button" key={c.id} onClick={() => toggleCat(c.id)} aria-pressed={on}
              className={`rounded-full border px-3 py-1.5 text-sm ${on ? 'border-primary bg-primary text-on-primary' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>{c.name}</button>;
          })}
        </div>
      </fieldset>
    </div>
  );
}

function GalleryForm({ content, onChange, errors }) {
  const { set, err } = useEditor(content, onChange, errors);
  const [open, setOpen] = useState(false);
  const { data: media } = useApi('/media');
  const byId = new Map((media ?? []).map((m) => [m.id, m]));
  return (
    <div className="space-y-4">
      <Field label="Título" error={err('title')}>{({ id }) => <Input id={id} value={content.title} onChange={set('title')} />}</Field>
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700">Imágenes ({content.imageIds.length}/24)</p>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {content.imageIds.map((id) => (
            <li key={id} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
              {byId.get(id) && <img src={thumbOf(byId.get(id))} alt={byId.get(id).alt} className="size-full object-cover" />}
              <button type="button" onClick={() => onChange({ ...content, imageIds: content.imageIds.filter((x) => x !== id) })} aria-label="Quitar"
                className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-red-600"><X className="size-3.5" /></button>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => setOpen(true)} className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-xs text-slate-500 hover:border-primary hover:text-primary">
              <ImagePlus className="size-5" /> Elegir
            </button>
          </li>
        </ul>
      </div>
      <MediaLibraryModal open={open} multiple initial={content.imageIds} onClose={() => setOpen(false)} onSelect={(ids) => onChange({ ...content, imageIds: ids })} />
    </div>
  );
}

function TestimonialsForm({ content, onChange, errors }) {
  const { set, err } = useEditor(content, onChange, errors);
  return (
    <div className="space-y-4">
      <Field label="Título" required error={err('title')}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={content.title} onChange={set('title')} />}</Field>
      <ListEditor items={content.items} onChange={set('items')} addLabel="Agregar testimonio" empty="Aún no hay testimonios."
        newItem={{ name: '', text: '', rating: 5 }}
        render={(it, update, i) => (
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Nombre" error={err(`items.${i}.name`)} className="sm:col-span-2">{({ id, invalid }) => <Input id={id} invalid={invalid} value={it.name} onChange={(e) => update({ name: e.target.value })} />}</Field>
            <Field label="Estrellas" error={err(`items.${i}.rating`)}>
              {({ id }) => <Select id={id} value={it.rating} onChange={(e) => update({ rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </Select>}
            </Field>
            <Field label="Opinión" error={err(`items.${i}.text`)} className="sm:col-span-3">{({ id, invalid }) => <Textarea id={id} invalid={invalid} rows={2} value={it.text} onChange={(e) => update({ text: e.target.value })} />}</Field>
          </div>
        )} />
    </div>
  );
}

function ScheduleForm({ content, onChange, errors }) {
  const { set, err } = useEditor(content, onChange, errors);
  return (
    <div className="space-y-4">
      <Field label="Título" required error={err('title')}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={content.title} onChange={set('title')} />}</Field>
      <ListEditor items={content.items} onChange={set('items')} addLabel="Agregar horario" empty="Sin horarios."
        newItem={{ days: '', hours: '' }}
        render={(it, update, i) => (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Días" error={err(`items.${i}.days`)}>{({ id, invalid }) => <Input id={id} invalid={invalid} placeholder="Lunes a viernes" value={it.days} onChange={(e) => update({ days: e.target.value })} />}</Field>
            <Field label="Horario" error={err(`items.${i}.hours`)}>{({ id, invalid }) => <Input id={id} invalid={invalid} placeholder="11:00 a. m. – 5:00 p. m." value={it.hours} onChange={(e) => update({ hours: e.target.value })} />}</Field>
          </div>
        )} />
      <Field label="Nota" error={err('note')}>{({ id }) => <Input id={id} value={content.note} onChange={set('note')} />}</Field>
    </div>
  );
}

function ContactForm({ content, onChange, errors }) {
  const { set, err } = useEditor(content, onChange, errors);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título" required error={err('title')}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={content.title} onChange={set('title')} />}</Field>
      <Field label="Subtítulo" error={err('subtitle')}>{({ id }) => <Input id={id} value={content.subtitle} onChange={set('subtitle')} />}</Field>
      <Switch checked={content.showMap} onChange={set('showMap')} label="Mostrar mapa" />
      <Switch checked={content.showWhatsapp} onChange={set('showWhatsapp')} label="Mostrar botón de WhatsApp" />
      <p className="text-xs text-slate-500 sm:col-span-2">La dirección, el teléfono y el WhatsApp se editan en <a href="/admin/apariencia" className="text-primary underline">Apariencia</a>.</p>
    </div>
  );
}

function TextForm({ content, onChange, errors }) {
  const { set, err } = useEditor(content, onChange, errors);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título" error={err('title')} className="sm:col-span-2">{({ id }) => <Input id={id} value={content.title} onChange={set('title')} />}</Field>
      <Field label="Texto" required error={err('body')} className="sm:col-span-2">{({ id, invalid }) => <Textarea id={id} invalid={invalid} rows={5} value={content.body} onChange={set('body')} />}</Field>
      <ImageField label="Imagen (opcional)" value={content.imageId} onChange={set('imageId')} />
      <Field label="Posición de la imagen">{({ id }) => <Select id={id} value={content.imagePosition} onChange={set('imagePosition')}><option value="right">A la derecha</option><option value="left">A la izquierda</option></Select>}</Field>
    </div>
  );
}

export const BLOCK_FORMS = { hero: HeroForm, menu: MenuForm, gallery: GalleryForm, testimonials: TestimonialsForm, schedule: ScheduleForm, contact: ContactForm, text: TextForm };

export const Stars = ({ n }) => <span className="inline-flex text-amber-500">{Array.from({ length: n }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}</span>;
