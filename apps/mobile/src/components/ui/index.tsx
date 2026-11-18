import Svg from 'react-native-svg';
import { withUniwind } from 'uniwind';

export * from './button';
export * from './checkbox';
export { default as colors } from './colors';
export * from './input';
export * from './modal';
export * from './select';
export * from './text';

// export base components from react-native
export {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
export { SafeAreaView } from 'react-native-safe-area-context';

// Apply withUniwind to Svg to add className support
export const StyledSvg = withUniwind(Svg);
