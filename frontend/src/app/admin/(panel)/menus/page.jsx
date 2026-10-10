'use client';
// MENÚ DE NAVEGACIÓN: el dueño ordena los enlaces arrastrándolos.
// Cada cambio de orden se guarda al instante (PUT /menus/:id/items/reorder).
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, IndentIncrease, IndentDecrease, ExternalLink, FileText, Menu as MenuIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { Button, Card, CardHeader, PageHeader, Modal, Field, Input, Select, Badge, EmptyState, SkeletonRows, ErrorState, useConfirm } from '@/components/ui';
import { SortableList, SortableRow } from '@/components/admin/SortableList';

const LOCATIONS = { header: 'Menú principal (arriba)', footer: 'Pie de página' };

// Árbol -> lista plana con marca de nivel (para poder arrastrar todo en una sola lista)
const flatten = (items) => items.flatMap((i) => [{ ...i, child: false }, ...i.children.map((c) => ({ ...c, child: true }))]);

// Lista plana -> [{ id, parentId }] para la API: un ítem "hijo" cuelga del último ítem raíz anterior
function toPayload(flat) {
  let lastRoot = null;
  return flat.map((item, index) => {
    const isChild = item.child && index > 0 && lastRoot;
    if (!isChild) lastRoot = item.id;
    return { id: item.id, parentId: isChild ? lastRoot : null };
  });
}

function ItemModal({ open, onClose, menuId, item, pages, onSaved }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(item
      ? { label: item.label, kind: item.pageId ? 'page' : 'url', pageId: item.pageId ?? pages[0]?.id, url: item.url ?? '' }
      : { label: '', kind: 'page', pageId: pages[0]?.id, url: '' });
    setErrors({});
  }, [open, item, pages]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = { label: form.label, ...(form.kind === 'page' ? { pageId: Number(form.pageId), url: null } : { url: form.url, pageId: null }) };
    try {
      if (item) await api.put(`/menus/items/${item.id}`, body);
      else await api.post(`/menus/${menuId}/items`, body);
      toast.success(item ? 'Enlace actualizado' : 'Enlace agregado');
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Editar enlace' : 'Nuevo enlace'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button form="item-form" type="submit" loading={saving}>Guardar</Button></>}>
      <form id="item-form" onSubmit={save} className="space-y-4">
        <Field label="Texto que se verá" required error={errors.label}>
          {({ id, invalid }) => <Input id={id} invalid={invalid} value={form.label ?? ''} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Ej. Nuestra carta" />}
        </Field>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">¿A dónde lleva?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[['page', 'Una página del sitio', FileText], ['url', 'Un enlace externo', ExternalLink]].map(([kind, label, Icon]) => (
              <button type="button" key={kind} onClick={() => setForm({ ...form, kind })} aria-pressed={form.kind === kind}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm ${form.kind === kind ? 'border-primary bg-primary-soft text-primary' : 'border-slate-200 text-slate-600'}`}>
                <Icon className="size-4 shrink-0" /> {label}
              </button>
            ))}
          </div>
        </fieldset>
        {form.kind === 'page' ? (
          <Field label="Página" error={errors.pageId}>
            {({ id }) => <Select id={id} value={form.pageId ?? ''} onChange={(e) => setForm({ ...form, pageId: e.target.value })}>
              {pages.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.path})</option>)}
            </Select>}
          </Field>
        ) : (
          <Field label="Dirección (URL)" hint="Ej. https://wa.me/51999888777" error={errors.url}>
            {({ id, invalid }) => <Input id={id} invalid={invalid} value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value })} />}
          </Field>
        )}
      </form>
    </Modal>
  );
}

function MenuEditor({ menu, pages, onChanged }) {
  const [flat, setFlat] = useState(flatten(menu.items));
  const [modal, setModal] = useState({ open: false, item: null });
  const confirm = useConfirm();
  useEffect(() => setFlat(flatten(menu.items)), [menu]);

  const persist = async (next) => {
    const previous = flat;
    setFlat(next); // actualización optimista: se ve el cambio al instante
    try {
      await api.put(`/menus/${menu.id}/items/reorder`, { items: toPayload(next) });
      onChanged();
    } catch (err) {
      setFlat(previous);
      toast.error(err.message);
    }
  };

  const setChild = (index, child) => {
    const next = flat.map((it, i) => (i === index ? { ...it, child } : it));
    // si un ítem raíz pasa a hijo, sus hijos pasan a colgar del raíz anterior (siguen siendo hijos)
    persist(next);
  };

  const toggle = async (item) => { await api.put(`/menus/items/${item.id}`, { isVisible: !item.isVisible }); onChanged(); };
  const remove = async (item) => {
    const extra = item.children?.length ? ` También se eliminarán sus ${item.children.length} sub-enlace(s).` : '';
    if (!(await confirm({ title: `¿Eliminar "${item.label}"?`, message: `Se quitará del menú.${extra}` }))) return;
    await api.del(`/menus/items/${item.id}`);
    toast.success('Enlace eliminado');
    onChanged();
  };

  return (
    <Card>
      <CardHeader title={LOCATIONS[menu.location] ?? menu.name} description="Arrastra ⋮⋮ para cambiar el orden. Usa → para convertir un enlace en submenú."
        actions={<Button size="sm" onClick={() => setModal({ open: true, item: null })}><Plus className="size-4" /> Agregar enlace</Button>} />
      {!flat.length ? (
        <EmptyState icon={MenuIcon} title="Este menú está vacío" description="Agrega el primer enlace." />
      ) : (
        <SortableList items={flat} onReorder={persist}>
          <ul className="divide-y divide-slate-100 p-2">
            {flat.map((item, index) => (
              <SortableRow key={item.id} id={item.id} className={item.child ? 'ml-6 border-l-2 border-slate-200 pl-1 sm:ml-10' : ''}>
                <div className="min-w-0 flex-1 py-2">
                  <p className={`truncate text-sm font-medium ${item.isVisible ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{item.label}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                    {item.isExternal ? <ExternalLink className="size-3 shrink-0" /> : <FileText className="size-3 shrink-0" />}
                    <span className="truncate">{item.href}</span>
                    {item.isExternal && <Badge>externo</Badge>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center">
                  {item.child
                    ? <IconBtn label="Subir a primer nivel" onClick={() => setChild(index, false)}><IndentDecrease className="size-4" /></IconBtn>
                    : index > 0 && !item.children?.length && <IconBtn label="Convertir en submenú" onClick={() => setChild(index, true)}><IndentIncrease className="size-4" /></IconBtn>}
                  <IconBtn label={item.isVisible ? 'Ocultar' : 'Mostrar'} onClick={() => toggle(item)}>{item.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</IconBtn>
                  <IconBtn label="Editar" onClick={() => setModal({ open: true, item })}><Pencil className="size-4" /></IconBtn>
                  <IconBtn label="Eliminar" danger onClick={() => remove(item)}><Trash2 className="size-4" /></IconBtn>
                </div>
              </SortableRow>
            ))}
          </ul>
        </SortableList>
      )}
      <ItemModal open={modal.open} item={modal.item} menuId={menu.id} pages={pages} onSaved={onChanged} onClose={() => setModal({ open: false, item: null })} />
    </Card>
  );
}

const IconBtn = ({ label, danger, children, ...props }) => (
  <button type="button" aria-label={label} title={label} {...props}
    className={`flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 ${danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:text-slate-700'}`}>
    {children}
  </button>
);

export default function MenusPage() {
  const menus = useApi('/menus');
  const pages = useApi('/pages');

  return (
    <>
      <PageHeader title="Menú de navegación" description="Ordena los enlaces que aparecen arriba y en el pie de tu sitio. Los cambios se guardan solos." />
      {menus.error ? <Card><ErrorState error={menus.error} onRetry={menus.reload} /></Card> :
        !menus.data || !pages.data ? <Card><SkeletonRows /></Card> : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {menus.data.map((m) => <MenuEditor key={m.id} menu={m} pages={pages.data} onChanged={menus.reload} />)}
          </div>
        )}
    </>
  );
}
