import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { queryClient } from '../lib/queryClient';
import { createBundle } from '../queries/bundles';
import { bundleKeys } from '../queries/keys';

export function useCreateBundle() {
  const userId = useAuth();

  return useMutation({
    mutationFn: (params: {
      name: string;
      description: string;
      color: string;
      icon: string;
      is_public: boolean;
    }) => createBundle({ ...params, ownerId: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries(bundleKeys.list(userId!));
    },
  });
}
