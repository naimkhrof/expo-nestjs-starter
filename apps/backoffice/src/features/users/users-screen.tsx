import { Button, Text } from '@starter/ui';
import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { ScrollView, View } from 'react-native';

import { listUsers, signOut } from '@/lib/api';
import type { Session } from '@/lib/session';
import { t } from '@/texts';

/** Accueil protégé : les utilisateurs de l'API, page par page. */
export function UsersScreen({ session }: { session: Session }) {
  const [page, setPage] = React.useState(1);
  const users = useQuery({
    queryKey: ['users', page],
    queryFn: () => listUsers(page),
    placeholderData: (previous) => previous,
  });

  return (
    <ScrollView contentContainerClassName="mx-auto w-full max-w-3xl gap-6 px-6 py-12">
      <View className="flex-row items-center justify-between gap-4">
        <View>
          <Text accessibilityRole="header" className="text-3xl font-bold">
            {t.users.title}
          </Text>
          <Text className="text-muted-foreground">{session.user.email}</Text>
        </View>
        <Button
          testID="sign-out"
          variant="outline"
          label={t.users.signOut}
          onPress={() => void signOut()}
        />
      </View>
      {users.isPending && <Text>{t.users.loading}</Text>}
      {users.isError && <Text accessibilityRole="alert">{t.users.error}</Text>}
      {users.data && users.data.data.length === 0 && <Text>{t.users.empty}</Text>}
      <View className="gap-2">
        {users.data?.data.map((user) => (
          <View
            key={user.id}
            className="gap-1 rounded-xl border border-border bg-card px-4 py-3"
          >
            <Text className="font-semibold">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || t.users.noName}
            </Text>
            <Text className="text-muted-foreground">{user.email}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row items-center justify-between gap-4">
        <Button
          variant="secondary"
          label={t.users.previous}
          disabled={page === 1}
          onPress={() => setPage((value) => value - 1)}
        />
        <Text>{`${t.users.page} ${page}`}</Text>
        <Button
          variant="secondary"
          label={t.users.next}
          disabled={!users.data?.hasNextPage}
          onPress={() => setPage((value) => value + 1)}
        />
      </View>
    </ScrollView>
  );
}
