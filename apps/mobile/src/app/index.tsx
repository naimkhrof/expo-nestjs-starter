import Env from '@env';
import { useQuery } from '@tanstack/react-query';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';

export default function HomeScreen() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const api = useQuery({
    queryKey: ['api-info', apiUrl],
    queryFn: async () => {
      if (!apiUrl) throw new Error('EXPO_PUBLIC_API_URL manque dans .env');
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`API : HTTP ${response.status}`);
      return response.json() as Promise<{ name: string }>;
    },
    retry: false,
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 justify-center gap-4 px-6">
        <Text className="text-3xl font-semibold">{Env.EXPO_PUBLIC_NAME}</Text>
        <Text>Socle Expo prêt pour le développement.</Text>
        <Text>
          {api.isPending ? 'Connexion à l’API…' : api.isError ? 'API indisponible — démarrer le backend.' : `API connectée : ${api.data.name}`}
        </Text>
        {api.isError && <Button label="Réessayer" onPress={() => void api.refetch()} />}
      </View>
    </SafeAreaView>
  );
}
