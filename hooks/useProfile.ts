import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { profileKeys } from '../queries/keys';

export type { ProfileData } from '../queries/profile';

export function useProfile() {
  const userId = useAuth();

  return useQuery({
    ...profileKeys.byUser(userId ?? ''),
    enabled: !!userId,
  });
}
