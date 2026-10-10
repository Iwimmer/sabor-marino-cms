'use client';
// Hook para cargar datos de la API con estados de carga y error.
// const { data, loading, error, reload, setData } = useApi('/pages');
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      setData(await api.get(path));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload, setData };
}
