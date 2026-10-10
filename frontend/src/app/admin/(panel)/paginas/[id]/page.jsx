'use client';
// EDITOR DE PÁGINA: datos de la página + constructor por bloques.
// Los bloques se ordenan arrastrando; cada uno se abre para editar su contenido.
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, ChevronDown, Eye, EyeOff, Copy, Trash2, ExternalLink, Save, Home, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { Button, Card, CardHeader, Modal, Field, Input, Textarea, Switch, Badge, EmptyState, SkeletonRows, ErrorState, useConfirm } from '@/components/ui';
import { SortableList, SortableRow } from '@/components/admin/SortableList';
import { BLOCK_META, BLOCK_FORMS, blockSummary } from '@/components/admin/BlockForms';

function PageSettings({ page, onSaved }) {
  const [form, setForm] = useState(page);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(page), [page]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api.put(`/pages/${page.id}`, {
        title: form.title, slug: form.slug, metaDescription: form.metaDescription || null,
        isPublished: form.isPublished, ...(form.isHome && !page.isHome && { isHome: true }),
      });
      toast.success('Datos de la página guardados');
      onSaved();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Datos de la página" />
      <form onSubmit={save} className="space-y-4 p-4 sm:p-6">
        <Field label="Título" required error={errors.title}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />}</Field>
        <Field label="Dirección (slug)" hint={`Se verá en /${form.slug}`} error={errors.slug}>
          {({ id, invalid }) => <Input id={id} invalid={invalid} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} disabled={page.isHome} />}
        </Field>
        <Field label="Descripción para Google" error={errors.metaDescription}>{({ id }) => <Textarea id={id} rows={3} value={form.metaDescription ?? ''} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />}</Field>
        <Switch checked={form.isPublished} disabled={page.isHome} onChange={(v) => setForm({ ...form, isPublished: v })} label="Publicada" description={page.isHome ? 'La página de inicio siempre está publicada' : 'Si la apagas, solo se ve en el panel'} />
        <Switch checked={form.isHome} disabled={page.isHome} onChange={(v) => setForm({ ...form, isHome: v })} label="Usar como página de inicio" description={page.isHome ? 'Esta es la portada del sitio' : 'Reemplaza a la portada actual'} />
        <Button type="submit" variant="secondary" loading={saving} className="w-full"><Save className="size-4" /> Guardar datos</Button>
      </form>
    </Card>
  );
}

function AddBlockModal({ open, onClose, pageId, onAdded }) {
  const { data: types } = useApi(open ? '/components/types' : null);
  const [adding, setAdding] = useState(null);
  const add = async (type) => {
    setAdding(type);
    try {
      const block = await api.post(`/pages/${pageId}/components`, { type });
      toast.success(`Bloque "${BLOCK_META[type].label}" agregado al final`);
      onAdded(block);
      onClose();
    } catch (err) { toast.error(err.message); } finally { setAdding(null); }
  };
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Agregar bloque" description="Elige qué tipo de sección quieres sumar a la página.">
      <ul className="grid gap-3 sm:grid-cols-2">
        {types?.map((t) => {
          const Icon = BLOCK_META[t.type].icon;
          return (
            <li key={t.type}>
              <button onClick={() => add(t.type)} disabled={!!adding}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary hover:bg-primary-soft disabled:opacity-60">
                <span className="rounded-lg bg-primary-soft p-2 text-primary"><Icon className="size-5" /></span>
                <span><span className="block font-medium text-slate-900">{t.label}</span><span className="block text-sm text-slate-500">{t.description}</span></span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

function BlockItem({ block, open, onToggle, onChanged, onRemoved, onDuplicated }) {
  const [content, setContent] = useState(block.content);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();
  useEffect(() => setContent(block.content), [block.content]);
  const Form = BLOCK_FORMS[block.type];
  const { label, icon: Icon } = BLOCK_META[block.type];
  const dirty = JSON.stringify(content) !== JSON.stringify(block.content);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const updated = await api.put(`/components/${block.id}`, { content });
      toast.success(`${label} guardado`);
      onChanged(updated);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
    } finally { setSaving(false); }
  };
  const toggleVisible = async () => onChanged(await api.put(`/components/${block.id}`, { isVisible: !block.isVisible }));
  const duplicate = async () => { onDuplicated(await api.post(`/components/${block.id}/duplicate`)); toast.success('Bloque duplicado'); };
  const remove = async () => {
    if (!(await confirm({ title: `¿Eliminar el bloque "${label}"?` }))) return;
    await api.del(`/components/${block.id}`);
    toast.success('Bloque eliminado');
    onRemoved(block.id);
  };

  return (
    <SortableRow id={block.id} className="flex-wrap rounded-xl border border-slate-200 px-1 sm:px-2">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 py-3 text-left">
        <span className={`rounded-lg p-2 ${block.isVisible ? 'bg-primary-soft text-primary' : 'bg-slate-100 text-slate-400'}`}><Icon className="size-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-900">{label} {!block.isVisible && <Badge>Oculto</Badge>} {dirty && <Badge color="amber">Sin guardar</Badge>}</span>
          <span className="block truncate text-xs text-slate-500">{blockSummary({ ...block, content })}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="flex shrink-0 items-center">
        <IconBtn label={block.isVisible ? 'Ocultar en el sitio' : 'Mostrar en el sitio'} onClick={toggleVisible}>{block.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</IconBtn>
        <IconBtn label="Duplicar" onClick={duplicate} className="hidden sm:flex"><Copy className="size-4" /></IconBtn>
        <IconBtn label="Eliminar" danger onClick={remove}><Trash2 className="size-4" /></IconBtn>
      </div>
      {open && (
        <div className="w-full border-t border-slate-100 px-2 py-4 sm:px-4">
          <Form content={content} onChange={setContent} errors={errors} />
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {dirty && <Button variant="ghost" onClick={() => { setContent(block.content); setErrors({}); }}>Descartar cambios</Button>}
            <Button onClick={save} loading={saving} disabled={!dirty}><Save className="size-4" /> Guardar bloque</Button>
          </div>
        </div>
      )}
    </SortableRow>
  );
}

const IconBtn = ({ label, danger, className = '', children, ...props }) => (
  <button type="button" aria-label={label} title={label} {...props}
    className={`flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 ${danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:text-slate-700'} ${className}`}>{children}</button>
);

export default function PageEditor() {
  const { id } = useParams();
  const router = useRouter();
  const { data: page, loading, error, reload, setData } = useApi(`/pages/${id}`);
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (error) return <Card><ErrorState error={error} onRetry={error.status === 404 ? () => router.push('/admin/paginas') : reload} /></Card>;
  if (loading && !page) return <Card><SkeletonRows rows={6} /></Card>;

  const setBlocks = (components) => setData({ ...page, components });
  const reorder = async (next) => {
    const previous = page.components;
    setBlocks(next);
    try { await api.put(`/pages/${page.id}/components/reorder`, { ids: next.map((b) => b.id) }); toast.success('Orden guardado'); }
    catch (err) { setBlocks(previous); toast.error(err.message); }
  };

  return (
    <>
      <div className="mb-6">
        <Button variant="ghost" size="sm" href="/admin/paginas" className="-ml-3 mb-2"><ArrowLeft className="size-4" /> Páginas</Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 truncate text-2xl font-semibold tracking-tight text-slate-900">
              {page.title} {page.isHome && <Badge color="blue"><Home className="mr-1 size-3" />Inicio</Badge>} {!page.isPublished && <Badge>Borrador</Badge>}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{page.components.length} bloques · {page.path}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="lg:hidden" onClick={() => setShowSettings(!showSettings)}><Settings2 className="size-4" /> Datos</Button>
            <Button variant="secondary" href={page.path} target="_blank"><ExternalLink className="size-4" /> Ver página</Button>
            <Button onClick={() => setAdding(true)}><Plus className="size-4" /> Agregar bloque</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!page.components.length ? (
            <Card><EmptyState title="Esta página aún no tiene bloques" description="Agrega una portada, la carta o un texto para empezar." action={<Button onClick={() => setAdding(true)}><Plus className="size-4" /> Agregar bloque</Button>} /></Card>
          ) : (
            <SortableList items={page.components} onReorder={reorder}>
              <ul className="space-y-3">
                {page.components.map((b) => (
                  <BlockItem key={b.id} block={b} open={openId === b.id} onToggle={() => setOpenId(openId === b.id ? null : b.id)}
                    onChanged={(u) => setBlocks(page.components.map((x) => (x.id === u.id ? u : x)))}
                    onRemoved={(bid) => setBlocks(page.components.filter((x) => x.id !== bid))}
                    onDuplicated={() => reload()} />
                ))}
              </ul>
            </SortableList>
          )}
        </div>
        <aside className={`${showSettings ? '' : 'hidden'} lg:block`}>
          <PageSettings page={page} onSaved={reload} />
        </aside>
      </div>

      <AddBlockModal open={adding} onClose={() => setAdding(false)} pageId={page.id}
        onAdded={(b) => { setBlocks([...page.components, b]); setOpenId(b.id); }} />
    </>
  );
}
