/** Session du back-office : la réponse de connexion de l'API, gardée dans le navigateur. */
export const ADMIN_ROLE_ID = 1;

export type SessionUser = {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role?: { id: number | string } | null;
};

export type Session = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: SessionUser;
};

const KEY = 'expo-nestjs-starter-backoffice-session';

export function isAdmin(session: Session | null): boolean {
  return Number(session?.user?.role?.id) === ADMIN_ROLE_ID;
}

function isSession(value: unknown): value is Session {
  const session = value as Session | null;
  return (
    typeof session?.token === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.user?.id === 'number'
  );
}

/** Le stockage peut manquer ou refuser (navigation privée) : la session vit alors le temps de la page. */
export function readSession(): Session | null {
  try {
    const stored = JSON.parse(globalThis.localStorage?.getItem(KEY) ?? 'null');
    return isSession(stored) && isAdmin(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null): void {
  try {
    if (session) globalThis.localStorage?.setItem(KEY, JSON.stringify(session));
    else globalThis.localStorage?.removeItem(KEY);
  } catch {
    // Rien à faire : la session reste en mémoire.
  }
}

type Listener = (session: Session | null) => void;
let current: Session | null | undefined;
const listeners = new Set<Listener>();

// Un autre onglet a renouvelé ou fermé la session : celui-ci la relit.
if (typeof globalThis.addEventListener === 'function') {
  globalThis.addEventListener('storage', (event: Event) => {
    if ((event as StorageEvent).key !== KEY) return;
    current = readSession();
    listeners.forEach((listener) => listener(current ?? null));
  });
}

export const sessionStore = {
  get(): Session | null {
    if (current === undefined) current = readSession();
    return current;
  },
  set(session: Session | null) {
    current = session && isAdmin(session) ? session : null;
    writeSession(current);
    listeners.forEach((listener) => listener(current ?? null));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
