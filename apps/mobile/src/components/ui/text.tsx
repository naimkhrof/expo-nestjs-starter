import type { TextBaseProps } from '@starter/ui/text';
import type { TxKeyPath } from '@/lib/i18n';
import { Text as BaseText } from '@starter/ui/text';
import * as React from 'react';

import { translate } from '@/lib/i18n';

type Props = { tx?: TxKeyPath } & TextBaseProps;

/** Le texte partagé avec le back-office (`packages/ui`), plus la traduction de l'app. */
export function Text({ tx, children, ...props }: Props) {
  return <BaseText {...props}>{tx ? translate(tx) : children}</BaseText>;
}
