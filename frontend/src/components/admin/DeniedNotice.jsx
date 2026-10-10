'use client';
// Muestra un aviso cuando el proxy redirigió a un EDITOR que intentó entrar a una zona de ADMIN.
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function DeniedNotice() {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get('denied')) toast.error('Esa sección es solo para administradores');
  }, [params]);
  return null;
}
