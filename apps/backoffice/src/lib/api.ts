import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { create, isAxiosError } from 'axios';

import type { Session, SessionUser } from './session';
import { isAdmin, sessionStore } from './session';

const base = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

/** Routes de l'API NestJS, préfixe et version compris. */
export const api = create({ baseURL: `${base}/api/v1` });

api.interceptors.request.use((config) => {
  const token = sessionStore.get()?.token;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<Session | null> | null = null;

/** Un seul renouvellement à la fois ; s'il échoue, la personne se reconnecte. */
function refresh(): Promise<Session | null> {
  refreshing ??= (async () => {
    const session = sessionStore.get();
    if (!session) return null;
    try {
      const { data } = await create({ baseURL: api.defaults.baseURL }).post(
        '/auth/refresh',
        undefined,
        { headers: { Authorization: `Bearer ${session.refreshToken}` } },
      );
      const next = { ...session, ...data, user: session.user };
      sessionStore.set(next);
      return next;
    } catch (error) {
      // Seul un refus de l'API ferme la session : une coupure de réseau la garde.
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401 || status === 403) sessionStore.set(null);
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
  const expired = error.response?.status === 401 && sessionStore.get();
  if (!request || !expired || request.retried) throw error;
  const session = await refresh();
  if (!session) throw error;
  request.retried = true;
  request.headers.Authorization = `Bearer ${session.token}`;
  return api.request(request);
});

export class NotAdminError extends Error {}

/** Ouvre la session par e-mail et mot de passe ; un compte non administrateur est refusé. */
export async function signIn(email: string, password: string): Promise<Session> {
  const { data } = await api.post<Session>('/auth/email/login', { email, password });
  if (!isAdmin(data)) throw new NotAdminError();
  sessionStore.set(data);
  return data;
}

export async function signOut(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // La session locale se ferme de toute façon.
  }
  sessionStore.set(null);
}

export type SignInError = 'invalid' | 'forbidden' | 'tooMany' | 'offline';

export function signInErrorOf(error: unknown): SignInError {
  if (error instanceof NotAdminError) return 'forbidden';
  if (isAxiosError(error) && error.response) {
    return error.response.status === 429 ? 'tooMany' : 'invalid';
  }
  return 'offline';
}

export type UsersPage = { data: SessionUser[]; hasNextPage: boolean };

export const USERS_PAGE_SIZE = 10;

/** Liste des utilisateurs (`GET /users`, réservé aux administrateurs). */
export async function listUsers(page: number): Promise<UsersPage> {
  const { data } = await api.get<UsersPage>('/users', {
    params: { page, limit: USERS_PAGE_SIZE },
  });
  return data;
}
