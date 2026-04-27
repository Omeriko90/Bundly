import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { queryClient } from '../lib/queryClient';
import { createInvitation } from '../queries/members';
import { bundleDetailKeys } from '../queries/keys';
import { broadcast } from '../lib/syncChannel';

export function useInviteMembers(bundleId: string) {
  const userId = useAuth();

  const mutation = useMutation({
    mutationFn: ({ email }: { email: string }) => {
      if (!userId) throw new Error('Not authenticated');
      return createInvitation({ bundleId, email, invitedBy: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bundleDetailKeys.members(bundleId).queryKey });
      if (userId) broadcast({ type: 'bundles_changed', userId });
    },
  });

  return { ...mutation, isAuthReady: userId !== null };
}
