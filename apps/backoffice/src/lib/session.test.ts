import type { Session } from './session';
import { isAdmin, sessionStore } from './session';

const session = (roleId: number): Session => ({
  token: 't',
  refreshToken: 'r',
  tokenExpires: 0,
  user: { id: 1, email: 'a@b.c', firstName: null, lastName: null, role: { id: roleId } },
});

describe('session', () => {
  it('reconnaît le rôle administrateur', () => {
    expect(isAdmin(session(1))).toBe(true);
    expect(isAdmin(session(2))).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it('refuse de garder une session non administrateur', () => {
    sessionStore.set(session(1));
    expect(sessionStore.get()?.token).toBe('t');
    sessionStore.set(session(2));
    expect(sessionStore.get()).toBeNull();
  });
});
