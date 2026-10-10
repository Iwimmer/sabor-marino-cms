'use client';
// APARIENCIA: colores, logo, contacto y redes sociales.
// La vista previa usa las mismas variables CSS que el sitio real, pero aplicadas solo
// a su contenedor; al guardar, router.refresh() vuelve a ejecutar el layout raíz
// y TODO el sitio (incluido este panel) toma los nuevos colores.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, RotateCcw, AlertTriangle, CheckCircle2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { brandCssVars, contrastRatio } from '@/lib/colors';
import { Button, Card, CardHeader, PageHeader, Field, Input, Textarea, Select, SkeletonRows, ErrorState, useConfirm } from '@/components/ui';
import ColorField from '@/components/admin/ColorField';
import { ImageField } from '@/components/admin/ImagePicker';

const PRESETS = [
  { name: 'Mar profundo', colors: { primary: '#0F4C75', secondary: '#3282B8', accent: '#F28C6B', background: '#FFFFFF', text: '#1E293B' } },
  { name: 'Arena y coral', colors: { primary: '#9A3B2E', secondary: '#C9734F', accent: '#E9B44C', background: '#FFFBF5', text: '#2B2118' } },
  { name: 'Verde costa', colors: { primary: '#1F5F5B', secondary: '#4E9F95', accent: '#F2B134', background: '#F7FAF9', text: '#16302E' } },
  { name: 'Noche limeña', colors: { primary: '#1E2A44', secondary: '#4A5D8A', accent: '#E8A33D', background: '#FFFFFF', text: '#111827' } },
];

const COLOR_FIELDS = [
  ['primary', 'Color principal', 'Botones, encabezados y enlaces'],
  ['secondary', 'Color secundario', 'Detalles y fondos de apoyo'],
  ['accent', 'Color de acento', 'Lo que debe destacar: ofertas, insignias'],
  ['background', 'Fondo', 'Color de fondo de las páginas'],
  ['text', 'Texto', 'Color de los párrafos'],
];

function ContrastCheck({ label, fg, bg }) {
  const ratio = contrastRatio(fg, bg);
  const ok = ratio >= 4.5;
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-slate-600">
        {ok ? <CheckCircle2 className="size-4 text-emerald-600" /> : <AlertTriangle className="size-4 text-amber-500" />} {label}
      </span>
      <span className={`font-mono text-xs ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>{ratio.toFixed(1)}:1</span>
    </li>
  );
}

/** Mini sitio que reacciona a los colores ANTES de guardarlos */
function Preview({ form }) {
  return (
    <div style={brandCssVars(form.colors)} className="overflow-hidden rounded-xl border border-slate-200 bg-surface text-ink shadow-sm">
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-on-primary">
        <span className="truncate font-display font-semibold">{form.siteName || 'Mi restaurante'}</span>
        <span className="hidden gap-3 text-xs opacity-90 sm:flex"><span>Inicio</span><span>Carta</span><span>Contacto</span></span>
      </div>
      <div className="space-y-3 px-4 py-6">
        <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-on-accent">Plato del día</span>
        <p className="font-display text-xl font-semibold text-primary">El mar llega fresco a tu mesa</p>
        <p className="text-sm">{form.slogan || 'Ceviches, causas y arroces marinos preparados al momento.'}</p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-on-primary">Ver la carta</span>
          <span className="rounded-lg border border-secondary px-3 py-1.5 text-sm font-medium text-secondary">Reservar</span>
        </div>
      </div>
      <div className="bg-primary-soft px-4 py-2 text-xs text-primary">{form.footerText || 'Pie de página'}</div>
    </div>
  );
}

function SocialLinks() {
  const { data, loading, reload } = useApi('/social-links');
  const confirm = useConfirm();
  const [draft, setDraft] = useState({ platform: 'instagram', url: '' });

  const add = async (e) => {
    e.preventDefault();
    try { await api.post('/social-links', draft); setDraft({ ...draft, url: '' }); reload(); toast.success('Red social agregada'); }
    catch (err) { toast.error(err instanceof ApiError ? Object.values(err.fieldErrors())[0] ?? err.message : err.message); }
  };
  const toggle = async (s) => { await api.put(`/social-links/${s.id}`, { isVisible: !s.isVisible }); reload(); };
  const remove = async (s) => {
    if (!(await confirm({ title: `¿Quitar ${s.platform}?` }))) return;
    await api.del(`/social-links/${s.id}`); reload(); toast.success('Red social eliminada');
  };

  return (
    <Card>
      <CardHeader title="Redes sociales" description="Aparecen en el pie de página del sitio." />
      {loading && !data ? <SkeletonRows rows={2} /> : (
        <ul className="divide-y divide-slate-100">
          {data.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <span className="w-20 shrink-0 text-sm font-medium capitalize text-slate-800">{s.platform}</span>
              <span className={`min-w-0 flex-1 truncate text-sm ${s.isVisible ? 'text-slate-600' : 'text-slate-400 line-through'}`}>{s.url}</span>
              <button onClick={() => toggle(s)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label={s.isVisible ? 'Ocultar' : 'Mostrar'}>
                {s.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              <button onClick={() => remove(s)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="flex flex-col gap-2 border-t border-slate-100 p-4 sm:flex-row sm:px-6">
        <Select value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value })} className="sm:w-40" aria-label="Red social">
          {['facebook', 'instagram', 'tiktok', 'youtube', 'x', 'whatsapp', 'otro'].map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Input placeholder="https://instagram.com/sabormarino" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} aria-label="Enlace" />
        <Button type="submit" variant="secondary" disabled={!draft.url}><Plus className="size-4" /> Agregar</Button>
      </form>
    </Card>
  );
}

export default function AparienciaPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useApi('/settings');
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm({
      siteName: data.siteName, slogan: data.slogan ?? '', logoId: data.logoId, colors: data.colors,
      phone: data.contact.phone ?? '', whatsapp: data.contact.whatsapp ?? '', email: data.contact.email ?? '',
      address: data.contact.address ?? '', mapEmbedUrl: data.contact.mapEmbedUrl ?? '', footerText: data.footerText ?? '',
    });
  }, [data]);

  if (error) return <Card><ErrorState error={error} onRetry={reload} /></Card>;
  if (loading || !form) return <Card><SkeletonRows rows={6} /></Card>;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setColor = (key) => (hex) => setForm({ ...form, colors: { ...form.colors, [key]: hex } });
  const dirty = JSON.stringify(form.colors) !== JSON.stringify(data.colors);

  const save = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrors({});
    const c = form.colors;
    const orNull = (v) => (v?.trim() ? v.trim() : null);
    try {
      await api.put('/settings', {
        siteName: form.siteName, slogan: orNull(form.slogan), logoId: form.logoId,
        primaryColor: c.primary, secondaryColor: c.secondary, accentColor: c.accent, backgroundColor: c.background, textColor: c.text,
        phone: orNull(form.phone), whatsapp: orNull(form.whatsapp), email: orNull(form.email),
        address: orNull(form.address), mapEmbedUrl: orNull(form.mapEmbedUrl), footerText: orNull(form.footerText),
      });
      toast.success('Apariencia guardada', { description: 'Los cambios ya se ven en todo el sitio.' });
      await reload();
      router.refresh(); // vuelve a ejecutar el layout raíz -> nuevas variables CSS
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Apariencia"
        description="Define la identidad de tu restaurante. Los colores se aplican a la web y a este panel."
        actions={<Button type="submit" loading={saving}><Save className="size-4" /> Guardar cambios</Button>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader title="Colores" description="Elige una paleta lista o ajusta cada color."
              actions={dirty && <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, colors: data.colors })}><RotateCcw className="size-4" /> Deshacer</Button>} />
            <div className="space-y-5 p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRESETS.map((p) => (
                  <button type="button" key={p.name} onClick={() => setForm({ ...form, colors: p.colors })}
                    className="rounded-lg border border-slate-200 p-2 text-left transition hover:border-slate-400">
                    <span className="flex h-6 overflow-hidden rounded">
                      {Object.values(p.colors).slice(0, 3).map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}
                    </span>
                    <span className="mt-1.5 block text-xs font-medium text-slate-700">{p.name}</span>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {COLOR_FIELDS.map(([key, label, hint]) => (
                  <ColorField key={key} label={label} hint={errors[`${key}Color`] ?? hint} value={form.colors[key]} onChange={setColor(key)} />
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Identidad" />
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
              <Field label="Nombre del restaurante" required error={errors.siteName}>
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={form.siteName} onChange={set('siteName')} />}
              </Field>
              <Field label="Eslogan" error={errors.slogan}>
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={form.slogan} onChange={set('slogan')} />}
              </Field>
              <div className="sm:col-span-2"><ImageField label="Logo" value={form.logoId} onChange={(logoId) => setForm({ ...form, logoId })} /></div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Contacto" description="Se usa en el bloque de contacto, el botón de WhatsApp y el pie de página." />
            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
              <Field label="Teléfono" error={errors.phone}>{({ id }) => <Input id={id} value={form.phone} onChange={set('phone')} />}</Field>
              <Field label="WhatsApp" hint="Con código de país, sin espacios: 51999888777" error={errors.whatsapp}>
                {({ id, invalid }) => <Input id={id} invalid={invalid} inputMode="numeric" value={form.whatsapp} onChange={set('whatsapp')} />}
              </Field>
              <Field label="Correo" error={errors.email}>{({ id, invalid }) => <Input id={id} invalid={invalid} type="email" value={form.email} onChange={set('email')} />}</Field>
              <Field label="Dirección" error={errors.address}>{({ id }) => <Input id={id} value={form.address} onChange={set('address')} />}</Field>
              <Field label="Mapa (URL para insertar de Google Maps)" error={errors.mapEmbedUrl} className="sm:col-span-2">
                {({ id, invalid }) => <Input id={id} invalid={invalid} value={form.mapEmbedUrl} onChange={set('mapEmbedUrl')} />}
              </Field>
              <Field label="Texto del pie de página" error={errors.footerText} className="sm:col-span-2">
                {({ id }) => <Textarea id={id} rows={2} value={form.footerText} onChange={set('footerText')} />}
              </Field>
            </div>
          </Card>

          <SocialLinks />
        </div>

        <aside className="space-y-4 lg:col-span-2">
          <div className="space-y-4 lg:sticky lg:top-8">
            <p className="text-sm font-medium text-slate-700">Vista previa</p>
            <Preview form={form} />
            <Card className="p-4">
              <p className="mb-2 text-sm font-medium text-slate-700">Legibilidad (WCAG AA: mínimo 4.5:1)</p>
              <ul className="space-y-1.5">
                <ContrastCheck label="Texto sobre el fondo" fg={form.colors.text} bg={form.colors.background} />
                <ContrastCheck label="Color principal sobre el fondo" fg={form.colors.primary} bg={form.colors.background} />
              </ul>
              <p className="mt-2 text-xs text-slate-500">El texto de los botones se elige solo (blanco u oscuro) para que siempre se lea.</p>
            </Card>
          </div>
        </aside>
      </div>
    </form>
  );
}
