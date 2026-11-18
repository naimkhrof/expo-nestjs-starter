import type { TextProps, TextStyle } from 'react-native';
import * as React from 'react';
import { I18nManager, Text as NNText, StyleSheet } from 'react-native';
import { twMerge } from 'tailwind-merge';

export type TextBaseProps = {
  className?: string;
} & TextProps;

/**
 * Texte de base, sans traduction : l'app mobile y ajoute sa prop `tx`, le
 * back-office écrit ses textes lui-même.
 */
export function Text({
  className = '',
  style,
  children,
  ...props
}: TextBaseProps) {
  const textStyle = React.useMemo(
    () =>
      twMerge(
        'font-inter text-base font-normal text-black dark:text-white',
        className,
      ),
    [className],
  );

  const nStyle = React.useMemo(
    () =>
      StyleSheet.flatten([
        {
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]) as TextStyle,
    [style],
  );
  return (
    <NNText className={textStyle} style={nStyle} {...props}>
      {children}
    </NNText>
  );
}
