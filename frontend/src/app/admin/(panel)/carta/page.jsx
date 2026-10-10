'use client';
// CARTA: categorías a la izquierda y platos de la categoría elegida a la derecha.
// En celular las categorías se muestran como "chips" deslizables arriba.
import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Star, UtensilsCrossed, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError, formatPrice } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { Button, Card, CardHeader, PageHeader, Modal, Field, Input, Textarea, Select, Switch, Badge, EmptyState, SkeletonRows, ErrorState, useConfirm } from '@/components/ui';
import { SortableList, SortableRow } from '@/components/admin/SortableList';
import { ImageField, thumbOf } from '@/components/admin/ImagePicker';

function CategoryModal({ open, onClose, category, onSaved }) {
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) { setForm(category ? { name: category.name, description: category.description ?? '', isActive: category.isActive } : { name: '', description: '', isActive: true }); setErrors({}); } }, [open, category]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { name: form.name, description: form.description || null, isActive: form.isActive };
      const saved = category ? await api.put(`/categories/${category.id}`, body) : await api.post('/categories', body);
      toast.success(category ? 'Categoría actualizada' : 'Categoría creada');
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" title={category ? 'Editar categoría' : 'Nueva categoría'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button form="cat-form" type="submit" loading={saving}>Guardar</Button></>}>
      <form id="cat-form" onSubmit={save} className="space-y-4">
        <Field label="Nombre" required error={errors.name}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Ceviches" />}</Field>
        <Field label="Descripción" error={errors.description}>{({ id }) => <Textarea id={id} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />}</Field>
        <Switch checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="Visible en la carta" />
      </form>
    </Modal>
  );
}

function DishModal({ open, onClose, dish, categories, defaultCategoryId, onSaved }) {
  const empty = { name: '', description: '', price: '', categoryId: defaultCategoryId, imageId: null, isAvailable: true, isFeatured: false };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      setForm(dish ? { ...dish, description: dish.description ?? '', price: String(dish.price) } : { ...empty, categoryId: defaultCategoryId });
      setErrors({});
    }
  }, [open, dish, defaultCategoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name, description: form.description || null, price: Number(form.price.replace(',', '.')),
        categoryId: Number(form.categoryId), imageId: form.imageId, isAvailable: form.isAvailable, isFeatured: form.isFeatured,
      };
      const saved = dish ? await api.put(`/dishes/${dish.id}`, body) : await api.post('/dishes', body);
      toast.success(dish ? 'Plato actualizado' : 'Plato agregado a la carta');
      onSaved(saved);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
    } finally { setSaving(false); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e?.target ? e.target.value : e });

  return (
    <Modal open={open} onClose={onClose} title={dish ? 'Editar plato' : 'Nuevo plato'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button form="dish-form" type="submit" loading={saving}>Guardar plato</Button></>}>
      <form id="dish-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del plato" required error={errors.name} className="sm:col-span-2">{({ id, invalid }) => <Input id={id} invalid={invalid} value={form.name} onChange={set('name')} placeholder="Ej. Ceviche clásico" />}</Field>
        <Field label="Precio (S/)" required error={errors.price}>
          {({ id, invalid }) => (
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">S/</span>
              <Input id={id} invalid={invalid} inputMode="decimal" value={form.price} onChange={set('price')} className="pl-9" placeholder="38.00" />
            </div>
          )}
        </Field>
        <Field label="Categoría" error={errors.categoryId}>{({ id }) => <Select id={id} value={form.categoryId ?? ''} onChange={set('categoryId')}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>}</Field>
        <Field label="Descripción" hint="Ingredientes o cómo se sirve" error={errors.description} className="sm:col-span-2">{({ id }) => <Textarea id={id} rows={2} value={form.description} onChange={set('description')} />}</Field>
        <div className="sm:col-span-2"><ImageField label="Foto del plato" value={form.imageId} onChange={set('imageId')} /></div>
        <Switch checked={form.isAvailable} onChange={set('isAvailable')} label="Disponible hoy" description="Apágalo si se acabó" />
        <Switch checked={form.isFeatured} onChange={set('isFeatured')} label="Destacado" description="Aparece en “Favoritos de la casa”" />
      </form>
    </Modal>
  );
}

export default function CartaPage() {
  const cats = useApi('/categories');
  const [activeId, setActiveId] = useState(null);
  const dishes = useApi(activeId ? `/dishes?categoryId=${activeId}` : null);
  const [q, setQ] = useState('');
  const [catModal, setCatModal] = useState({ open: false, category: null });
  const [dishModal, setDishModal] = useState({ open: false, dish: null });
  const confirm = useConfirm();

  useEffect(() => { if (cats.data?.length && !cats.data.some((c) => c.id === activeId)) setActiveId(cats.data[0].id); }, [cats.data, activeId]);
  const active = cats.data?.find((c) => c.id === activeId);
  const visibleDishes = useMemo(() => (dishes.data ?? []).filter((d) => !q || `${d.name} ${d.description}`.toLowerCase().includes(q.toLowerCase())), [dishes.data, q]);

  const reorderCats = async (next) => {
    const prev = cats.data;
    cats.setData(next);
    try { await api.put('/categories/reorder', { ids: next.map((c) => c.id) }); } catch (err) { cats.setData(prev); toast.error(err.message); }
  };
  const reorderDishes = async (next) => {
    const prev = dishes.data;
    dishes.setData(next);
    try { await api.put(`/categories/${activeId}/dishes/reorder`, { ids: next.map((d) => d.id) }); } catch (err) { dishes.setData(prev); toast.error(err.message); }
  };
  const removeCat = async (c) => {
    if (!(await confirm({ title: `¿Eliminar la categoría "${c.name}"?` }))) return;
    try { await api.del(`/categories/${c.id}`); toast.success('Categoría eliminada'); setActiveId(null); cats.reload(); }
    catch (err) { toast.error(err.message); }
  };
  const quickToggle = async (d, key) => {
    const updated = await api.put(`/dishes/${d.id}`, { [key]: !d[key] });
    dishes.setData(dishes.data.map((x) => (x.id === d.id ? updated : x)));
    if (key === 'isAvailable') toast.success(updated.isAvailable ? `${d.name}: disponible` : `${d.name}: marcado como agotado`);
  };
  const removeDish = async (d) => {
    if (!(await confirm({ title: `¿Eliminar "${d.name}"?` }))) return;
    await api.del(`/dishes/${d.id}`);
    toast.success('Plato eliminado');
    dishes.reload(); cats.reload();
  };

  if (cats.error) return <Card><ErrorState error={cats.error} onRetry={cats.reload} /></Card>;

  return (
    <>
      <PageHeader title="Carta" description="Organiza tus platos por categoría. Arrastra para cambiar el orden en que aparecen en la web."
        actions={<>
          <Button variant="secondary" onClick={() => setCatModal({ open: true, category: null })}><FolderPlus className="size-4" /> Categoría</Button>
          <Button onClick={() => setDishModal({ open: true, dish: null })} disabled={!active}><Plus className="size-4" /> Plato</Button>
        </>} />

      {!cats.data ? <Card><SkeletonRows /></Card> : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Celular/tablet: chips con scroll horizontal INTERNO */}
          <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:hidden">
            <div className="flex w-max gap-2">
              {cats.data.map((c) => (
                <button key={c.id} onClick={() => setActiveId(c.id)} aria-pressed={c.id === activeId}
                  className={`h-10 rounded-full border px-4 text-sm font-medium whitespace-nowrap ${c.id === activeId ? 'border-primary bg-primary text-on-primary' : 'border-slate-300 bg-white text-slate-600'}`}>
                  {c.name} <span className="opacity-70">({c.dishesCount})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Escritorio: lista lateral reordenable */}
          <Card className="hidden self-start lg:block">
            <CardHeader title="Categorías" />
            <SortableList items={cats.data} onReorder={reorderCats}>
              <ul className="space-y-1 p-2">
                {cats.data.map((c) => (
                  <SortableRow key={c.id} id={c.id} className={`rounded-lg ${c.id === activeId ? 'bg-primary-soft' : 'hover:bg-slate-50'}`}>
                    <button onClick={() => setActiveId(c.id)} className="min-w-0 flex-1 py-2 text-left">
                      <span className={`block truncate text-sm font-medium ${c.id === activeId ? 'text-primary' : 'text-slate-800'}`}>{c.name}</span>
                      <span className="text-xs text-slate-500">{c.dishesCount} platos {!c.isActive && '· oculta'}</span>
                    </button>
                  </SortableRow>
                ))}
              </ul>
            </SortableList>
          </Card>

          <Card className="min-w-0">
            <CardHeader title={active ? active.name : 'Platos'} description={active?.description}
              actions={active && <>
                <Button size="sm" variant="ghost" onClick={() => setCatModal({ open: true, category: active })}><Pencil className="size-4" /> Categoría</Button>
                <Button size="sm" variant="ghost" onClick={() => removeCat(active)} className="text-slate-500 hover:text-red-600" aria-label="Eliminar categoría"><Trash2 className="size-4" /></Button>
              </>} />
            <div className="border-b border-slate-100 p-3 sm:px-6">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en esta categoría…" className="pl-9" aria-label="Buscar platos" />
              </div>
            </div>
            {dishes.loading && !dishes.data ? <SkeletonRows /> : !visibleDishes.length ? (
              <EmptyState icon={UtensilsCrossed} title={q ? 'Sin resultados' : 'Esta categoría no tiene platos'}
                action={!q && <Button onClick={() => setDishModal({ open: true, dish: null })}><Plus className="size-4" /> Agregar plato</Button>} />
            ) : (
              <SortableList items={visibleDishes} onReorder={q ? () => toast.info('Borra la búsqueda para reordenar') : reorderDishes}>
                <ul className="divide-y divide-slate-100">
                  {visibleDishes.map((d) => (
                    <SortableRow key={d.id} id={d.id} className="px-2 py-2 sm:px-4">
                      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                        {d.image ? <img src={thumbOf(d.image)} alt="" className="size-full object-cover" /> : <UtensilsCrossed className="size-5 text-slate-300" />}
                      </div>
                      <button onClick={() => setDishModal({ open: true, dish: d })} className="min-w-0 flex-1 text-left">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className={`truncate text-sm font-medium ${d.isAvailable ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{d.name}</span>
                          {d.isFeatured && <Badge color="amber"><Star className="mr-0.5 size-3 fill-current" />Destacado</Badge>}
                          {!d.isAvailable && <Badge color="red">Agotado</Badge>}
                        </span>
                        <span className="line-clamp-1 text-xs text-slate-500">{d.description}</span>
                      </button>
                      <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums">{formatPrice(d.price)}</span>
                      <div className="hidden shrink-0 sm:block">
                        <Switch checked={d.isAvailable} onChange={() => quickToggle(d, 'isAvailable')} label={<span className="sr-only">Disponible</span>} />
                      </div>
                      <button onClick={() => removeDish(d)} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${d.name}`}><Trash2 className="size-4" /></button>
                    </SortableRow>
                  ))}
                </ul>
              </SortableList>
            )}
          </Card>
        </div>
      )}

      <CategoryModal open={catModal.open} category={catModal.category} onClose={() => setCatModal({ open: false, category: null })}
        onSaved={(c) => { cats.reload(); setActiveId(c.id); }} />
      <DishModal open={dishModal.open} dish={dishModal.dish} categories={cats.data ?? []} defaultCategoryId={activeId}
        onClose={() => setDishModal({ open: false, dish: null })}
        onSaved={(d) => { cats.reload(); if (d.categoryId === activeId) dishes.reload(); else setActiveId(d.categoryId); }} />
    </>
  );
}
