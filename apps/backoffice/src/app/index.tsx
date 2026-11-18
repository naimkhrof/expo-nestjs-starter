import { LoginScreen } from '@/features/access/login-screen';
import { UsersScreen } from '@/features/users/users-screen';
import { isAdmin } from '@/lib/session';
import { useSession } from '@/lib/use-session';

/** Page protégée : la connexion tant qu'aucun administrateur n'est connecté, sinon les utilisateurs. */
export default function Home() {
  const session = useSession();
  if (!session || !isAdmin(session)) return <LoginScreen />;
  return <UsersScreen session={session} />;
}
