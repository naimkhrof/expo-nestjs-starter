import { create } from 'axios';

export const client = create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});
