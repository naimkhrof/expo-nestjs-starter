import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';

type Props = { hidden?: boolean };
export function FocusAwareStatusBar({ hidden = false }: Props) {
  const isFocused = useIsFocused();
  const { theme } = useUniwind();
  return isFocused ? <StatusBar style={theme === 'light' ? 'dark' : 'light'} hidden={hidden} /> : null;
}
