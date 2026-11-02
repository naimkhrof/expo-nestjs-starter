import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/ai-sdk';

// Mount inside AssistantRuntimeProvider when the NestJS chat endpoint is ready.
// No AI provider key belongs in the mobile app.
export function useAppRuntime() {
  const endpoint = process.env.EXPO_PUBLIC_CHAT_ENDPOINT_URL;
  if (!endpoint) throw new Error('EXPO_PUBLIC_CHAT_ENDPOINT_URL is required');

  return useChatRuntime({
    transport: new AssistantChatTransport({ api: endpoint }),
  });
}
