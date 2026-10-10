'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button, Field, Input } from '@/components/ui';

export default function LoginForm({ next, showDemoUsers = false }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');
    try {
      await api.post('/auth/login', form); // la API responde con la cookie httpOnly
      router.replace(next);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors());
        setMessage(err.status === 400 ? '' : err.message);
      } else {
        setMessage('No se pudo conectar con el servidor. ¿Está encendida la API?');
      }
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      {message && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{message}</div>
      )}

      <Field label="Correo electrónico" error={errors.email}>
        {({ id, invalid }) => (
          <Input id={id} invalid={invalid} type="email" autoComplete="email" inputMode="email"
            placeholder="tu@correo.com" value={form.email} onChange={set('email')} />
        )}
      </Field>

      <Field label="Contraseña" error={errors.password}>
        {({ id, invalid }) => (
          <div className="relative">
            <Input id={id} invalid={invalid} type={showPass ? 'text' : 'password'} autoComplete="current-password"
              value={form.password} onChange={set('password')} className="pr-11" />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
              aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        )}
      </Field>

      <Button type="submit" loading={loading} className="w-full">
        {!loading && <LogIn className="size-4" />} Entrar al panel
      </Button>

      {/* Ayuda para la revisión del proyecto: solo aparece si SHOW_DEMO_USERS=true en .env.local */}
      {showDemoUsers && <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="mb-1 font-medium text-slate-700">Usuarios de demostración</p>
        <button type="button" className="block text-left hover:text-primary" onClick={() => setForm({ email: 'admin@sabormarino.pe', password: 'Admin123*' })}>
          ADMIN · admin@sabormarino.pe · Admin123*
        </button>
        <button type="button" className="mt-0.5 block text-left hover:text-primary" onClick={() => setForm({ email: 'editor@sabormarino.pe', password: 'Editor123*' })}>
          EDITOR · editor@sabormarino.pe · Editor123*
        </button>
      </div>}
    </form>
  );
}
