import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const id = data.user?.id ?? null;
      setUserId(id);
      if (!id) router.replace('/');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return userId;
}
