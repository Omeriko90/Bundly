import { AppState, AppStateStatus } from 'react-native';
import { focusManager } from '@tanstack/react-query';

export function setupFocusManager() {
  const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    focusManager.setFocused(state === 'active');
  });
  return () => subscription.remove();
}
