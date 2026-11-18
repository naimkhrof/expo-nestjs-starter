import { Button, Input, Text } from '@starter/ui';
import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { View } from 'react-native';

import { signIn, signInErrorOf } from '@/lib/api';
import { t } from '@/texts';

/** Connexion d'un administrateur de l'API. */
export function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const login = useMutation({
    mutationFn: () => signIn(email.trim(), password),
  });
  const ready = email.trim() !== '' && password !== '';
  const submit = () => {
    if (ready && !login.isPending) login.mutate();
  };

  return (
    <View className="mx-auto w-full max-w-md flex-1 gap-6 px-6 pt-24 pb-8">
      <View className="gap-2">
        <Text accessibilityRole="header" className="text-3xl font-bold">
          {t.login.title}
        </Text>
        <Text className="text-muted-foreground">{t.login.intro}</Text>
      </View>
      <View className="gap-2">
        <Input
          testID="login-email"
          label={t.login.email}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
        />
        <Input
          testID="login-password"
          label={t.login.password}
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={submit}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
        />
        {login.isError && (
          <Text testID="login-error" accessibilityRole="alert" className="text-sm text-danger-600">
            {t.login[signInErrorOf(login.error)]}
          </Text>
        )}
        <Button
          testID="login-submit"
          label={t.login.submit}
          loading={login.isPending}
          disabled={!ready}
          onPress={submit}
        />
      </View>
    </View>
  );
}
