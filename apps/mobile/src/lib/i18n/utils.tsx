import type TranslateOptions from 'i18next';
import type { Language, resources } from './resources';
import type { RecursiveKeyOf } from './types';
import { changeLanguage as setI18nLanguage, t } from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback } from 'react';
import { I18nManager, Platform } from 'react-native';
import { reloadAsync } from 'expo-updates';

import { useMMKVString } from 'react-native-mmkv';
import { storage } from '../storage';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = () =>
  Platform.OS === 'web' && typeof window === 'undefined'
    ? undefined
    : storage.getString(LOCAL);

export const translate = memoize(
  (key: TxKeyPath, options = undefined) =>
    t(key, options) as unknown as string,
  (key: TxKeyPath, options: typeof TranslateOptions) =>
    options ? key + JSON.stringify(options) : key,
);

export function changeLanguage(lang: Language) {
  setI18nLanguage(lang);
  if (lang === 'ar') {
    I18nManager.forceRTL(true);
  }
  else {
    I18nManager.forceRTL(false);
  }
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    void reloadAsync();
  }
  else if (Platform.OS === 'web') {
    window.location.reload();
  }
}

export function useSelectedLanguage() {
  const [language, setLang] = useMMKVString(LOCAL);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLang(lang);
      if (lang !== undefined)
        changeLanguage(lang as Language);
    },
    [setLang],
  );

  return { language: language as Language, setLanguage };
}
