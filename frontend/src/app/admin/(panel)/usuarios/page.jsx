'use client';
// USUARIOS (solo ADMIN): quién puede entrar al panel y con qué rol.
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Shield, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { Button, Card, PageHeader, Modal, Field, Input, Select, Switch, Badge, SkeletonRows, ErrorState, useConfirm } from '@/components/ui';

const ROLE_INFO = {
  ADMIN: 'Puede cambiar todo, incluida la apariencia y los usuarios.',
  EDITOR: 'Edita páginas, carta, menús e imágenes. No toca apariencia ni usuarios.',
};
const when = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : 'Nunca');

function UserModal({ open, onClose, user, onSaved }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) { setForm(user ? { name: user.name, email: user.email, role: user.role, isActive: user.isActive, password: '' } : { name: '', email: '', role: 'EDITOR', isActive: true, password: '' }); setErrors({}); }
  }, [open, user]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = { name: form.name, email: form.email, role: form.role, isActive: form.isActive, ...(form.password && { password: form.password }) };
    try {
      if (user) await api.put(`/users/${user.id}`, body); else await api.post('/users', body);
      toast.success(user ? 'Usuario actualizado' : 'Usuario creado');
      onSaved(); onClose();
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fieldErrors());
      toast.error(err.message);
    } finally { setSaving(false); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e?.target ? e.target.value : e });

  return (
    <Modal open={open} onClose={onClose} title={user ? 'Editar usuario' : 'Nuevo usuario'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button form="user-form" type="submit" loading={saving}>Guardar</Button></>}>
      <form id="user-form" onSubmit={save} className="space-y-4">
        <Field label="Nombre" required error={errors.name}>{({ id, invalid }) => <Input id={id} invalid={invalid} value={form.name ?? ''} onChange={set('name')} />}</Field>
        <Field label="Correo" required error={errors.email}>{({ id, invalid }) => <Input id={id} invalid={invalid} type="email" value={form.email ?? ''} onChange={set('email')} />}</Field>
        <Field label={user ? 'Nueva contraseña' : 'Contraseña'} required={!user} error={errors.password} hint={user ? 'Déjala vacía para no cambiarla' : 'Mínimo 8 caracteres, una mayúscula y un número'}>
          {({ id, invalid }) => <Input id={id} invalid={invalid} type="password" autoComplete="new-password" value={form.password ?? ''} onChange={set('password')} />}
        </Field>
        <Field label="Rol" hint={ROLE_INFO[form.role]}>{({ id }) => <Select id={id} value={form.role} onChange={set('role')}><option value="EDITOR">Editor</option><option value="ADMIN">Administrador</option></Select>}</Field>
        <Switch checked={!!form.isActive} onChange={set('isActive')} label="Activo" description="Un usuario inactivo no puede iniciar sesión" />
      </form>
    </Modal>
  );
}

export default function UsuariosPage() {
  const { data, loading, error, reload } = useApi('/users');
  const me = useApi('/auth/me');
  const [modal, setModal] = useState({ open: false, user: null });
  const confirm = useConfirm();

  const remove = async (u) => {
    if (!(await confirm({ title: `¿Eliminar a ${u.name}?`, message: 'Ya no podrá entrar al panel. Sus páginas se conservan.' }))) return;
    try { await api.del(`/users/${u.id}`); toast.success('Usuario eliminado'); reload(); } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <PageHeader title="Usuarios" description="Personas que pueden entrar a este panel."
        actions={<Button onClick={() => setModal({ open: true, user: null })}><Plus className="size-4" /> Nuevo usuario</Button>} />
      <Card>
        {error ? <ErrorState error={error} onRetry={reload} /> : loading && !data ? <SkeletonRows /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr><th className="px-4 py-3 font-medium sm:px-6">Usuario</th><th className="px-4 py-3 font-medium">Rol</th><th className="px-4 py-3 font-medium">Último ingreso</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u.id} className={u.isActive ? '' : 'opacity-60'}>
                    <td className="px-4 py-3 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">{u.role === 'ADMIN' ? <Shield className="size-4" /> : <UserRound className="size-4" />}</span>
                        <div className="min-w-0"><p className="truncate font-medium text-slate-900">{u.name} {me.data?.user.id === u.id && <span className="text-xs font-normal text-slate-500">(tú)</span>}</p><p className="truncate text-xs text-slate-500">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{u.role === 'ADMIN' ? <Badge color="blue">Administrador</Badge> : <Badge>Editor</Badge>} {!u.isActive && <Badge color="red">Inactivo</Badge>}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">{when(u.lastLoginAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setModal({ open: true, user: u })} aria-label={`Editar a ${u.name}`}><Pencil className="size-4" /></Button>
                        {me.data?.user.id !== u.id && <Button size="sm" variant="ghost" onClick={() => remove(u)} aria-label={`Eliminar a ${u.name}`} className="text-slate-400 hover:text-red-600"><Trash2 className="size-4" /></Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <UserModal open={modal.open} user={modal.user} onClose={() => setModal({ open: false, user: null })} onSaved={reload} />
    </>
  );
}
