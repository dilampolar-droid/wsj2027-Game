import { useState, useEffect } from 'react';

// 1. Definimos explícitamente qué devuelve el hook
interface SessionData {
  patrulla: any;
  loading: boolean;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  advanceLevel: (nextLevel: number) => void;
}

export function useSession(): SessionData {
  const [patrulla, setPatrulla] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem('wsj2027_patrulla');
    if (stored) {
      setPatrulla(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (code: string): Promise<boolean> => {
    // Aquí iría tu lógica de Supabase (getPatrullaByCode)
    // Asegúrate de que retorne true o false
    return false; 
  };

  const logout = () => {
    setPatrulla(null);
    localStorage.removeItem('wsj2027_patrulla');
  };

  const advanceLevel = (nextLevel: number) => {
    if (patrulla) {
      const updated = { ...patrulla, nivel_actual: nextLevel };
      setPatrulla(updated);
      localStorage.setItem('wsj2027_patrulla', JSON.stringify(updated));
    }
  };

  // 2. El return debe ser lo ÚLTIMO en la función y cumplir con SessionData
  return { patrulla, loading, login, logout, advanceLevel };
}