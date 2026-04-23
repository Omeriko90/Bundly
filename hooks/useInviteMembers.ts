import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { queryClient } from '../lib/queryClient';
import { createInvitation } from '../queries/members';
import { bundleDetailKeys } from '../queries/keys';

export function useInviteMembers(bundleId: string) {
  const userId = useAuth();

  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      createInvitation({ bundleId, email, invitedBy: userId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bundleDetailKeys.members(bundleId).queryKey });
    },
  });
}
