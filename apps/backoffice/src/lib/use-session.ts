import * as React from 'react';

import { sessionStore } from './session';

export function useSession() {
  return React.useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.get,
    () => null,
  );
}
