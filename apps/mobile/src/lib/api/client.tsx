import { create } from 'axios';
import Constants from 'expo-constants';

import { resolveApiUrl } from './resolve-api-url';

export const client = create({
  baseURL: resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, Constants.expoConfig?.hostUri, __DEV__),
});
