import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { queryClient } from '../lib/queryClient';
import { createBundle } from '../queries/bundles';
import { bundleKeys } from '../queries/keys';

export function useCreateBundle() {
  const userId = useAuth();

  const mutation = useMutation({
    mutationFn: (params: {
      name: string;
      description: string;
      color: string;
      icon: string;
      is_public: boolean;
    }) => {
      if (!userId) throw new Error('Not authenticated');
      return createBundle({ ...params, ownerId: userId });
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: bundleKeys.list(userId).queryKey });
      }
    },
  });

  return { ...mutation, isAuthReady: userId !== null };
}
