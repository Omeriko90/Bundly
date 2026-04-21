import { supabase } from '../lib/supabase';

export type BundleDetail = {
  id: string;
  name: string;
  description: string | null;
  color: string;
};

export async function fetchBundle(id: string): Promise<BundleDetail> {
  const db = supabase as any;
  const { data, error } = await db
    .from('bundles')
    .select('id, name, description, color')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as BundleDetail;
}
