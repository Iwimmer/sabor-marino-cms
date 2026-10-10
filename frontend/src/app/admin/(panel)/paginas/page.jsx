'use client';
// LISTA DE PÁGINAS: tabla en escritorio, tarjetas en celular.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, ExternalLink, Trash2, Home, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { Button, Card, PageHeader, Modal, Field, Input, Textarea, Badge, EmptyState, SkeletonRows, ErrorState, useConfirm } from '@/components/ui';

const date = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

function NewPageModal({ open, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', metaDescription: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const page = await api.post('/pages', { title: form.title, metaDescription: form.metaDescription || null });
      toast.success('Página creada', { description: 'Ahora agrégale bloques.' });
      router.push(`/admin/paginas/${page.id}`);
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva página" description="La dirección (URL) se crea sola a partir del título."
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button form="new-page" type="submit" loading={saving}>Crear página</Button></>}>
      <form id="new-page" onSubmit={save} className="space-y-4">
        <Field label="Título" required error={errors.title} hint={form.title && `Dirección: /${form.title.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`}>
          {({ id, invalid }) => <Input id={id} invalid={invalid} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej. Promociones" />}
        </Field>
        <Field label="Descripción para Google" hint="Opcional. Máximo 300 caracteres." error={errors.metaDescription}>
          {({ id }) => <Textarea id={id} rows={2} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />}
        </Field>
      </form>
    </Modal>
  );
}

export default function PaginasPage() {
  const { data, loading, error, reload } = useApi('/pages');
  const [creating, setCreating] = useState(false);
  const confirm = useConfirm();

  const remove = async (p) => {
    if (!(await confirm({ title: `¿Eliminar "${p.title}"?`, message: `Se borrará la página y sus ${p.componentsCount} bloque(s). Si está en el menú de navegación, su enlace también se quitará.` }))) return;
    try { await api.del(`/pages/${p.id}`); toast.success('Página eliminada'); reload(); }
    catch (err) { toast.error(err.message); }
  };

  const status = (p) => p.isHome ? <Badge color="blue"><Home className="mr-1 size-3" />Inicio</Badge>
    : p.isPublished ? <Badge color="green">Publicada</Badge> : <Badge>Borrador</Badge>;

  return (
    <>
      <PageHeader title="Páginas" description="Cada página se arma con bloques: portada, carta, galería, testimonios y más."
        actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> Nueva página</Button>} />
      <Card>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <SkeletonRows /> : !data.length ? (
          <EmptyState icon={FileText} title="No hay páginas" action={<Button onClick={() => setCreating(true)}>Crear la primera</Button>} />
        ) : (
          <>
            {/* Celular: tarjetas */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {data.map((p) => (
                <li key={p.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <a href={`/admin/paginas/${p.id}`} className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{p.title}</p>
                      <p className="truncate text-sm text-slate-500">{p.path} · {p.componentsCount} bloques</p>
                    </a>
                    {status(p)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="secondary" href={`/admin/paginas/${p.id}`}><Pencil className="size-4" /> Editar</Button>
                    <Button size="sm" variant="ghost" href={p.path} target="_blank"><ExternalLink className="size-4" /> Ver</Button>
                    {!p.isHome && <Button size="sm" variant="ghost" onClick={() => remove(p)} className="ml-auto text-red-600"><Trash2 className="size-4" /></Button>}
                  </div>
                </li>
              ))}
            </ul>

            {/* Tablet y escritorio: tabla con scroll interno si no entra */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                  <tr><th className="px-6 py-3 font-medium">Página</th><th className="px-4 py-3 font-medium">Estado</th><th className="px-4 py-3 font-medium">Bloques</th><th className="px-4 py-3 font-medium">Actualizada</th><th className="px-6 py-3" /></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3"><a href={`/admin/paginas/${p.id}`} className="font-medium text-slate-900 hover:text-primary">{p.title}</a><p className="text-xs text-slate-500">{p.path}</p></td>
                      <td className="px-4 py-3">{status(p)}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-600">{p.componentsCount}</td>
                      <td className="px-4 py-3 text-slate-500">{date(p.updatedAt)}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="secondary" href={`/admin/paginas/${p.id}`}><Pencil className="size-4" /> Editar</Button>
                          <Button size="sm" variant="ghost" href={p.path} target="_blank" aria-label="Ver en el sitio"><ExternalLink className="size-4" /></Button>
                          {!p.isHome && <Button size="sm" variant="ghost" onClick={() => remove(p)} aria-label="Eliminar" className="text-slate-400 hover:text-red-600"><Trash2 className="size-4" /></Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
      <NewPageModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}
