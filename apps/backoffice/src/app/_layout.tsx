import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { Uniwind } from 'uniwind';

import '../global.css';

// Clair ou sombre, comme l'appareil.
Uniwind.setTheme('system');

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 }, mutations: { retry: false } },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View className="min-h-screen flex-1 bg-background">
        <Slot />
      </View>
    </QueryClientProvider>
  );
}
