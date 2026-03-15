// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'chevron.down': 'keyboard-arrow-down',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'plus': 'add',
  'plus.circle.fill': 'add-circle',
  'minus': 'remove',
  'trash': 'delete',
  'pencil': 'edit',
  'ellipsis': 'more-horiz',
  // Finance
  'dollarsign.circle.fill': 'monetization-on',
  'creditcard.fill': 'credit-card',
  'banknote.fill': 'account-balance-wallet',
  'chart.bar.fill': 'bar-chart',
  'chart.pie.fill': 'pie-chart',
  'arrow.up.circle.fill': 'arrow-upward',
  'arrow.down.circle.fill': 'arrow-downward',
  'list.bullet': 'list',
  'calendar': 'calendar-today',
  'target': 'track-changes',
  'flag.fill': 'flag',
  // Categories
  'cart.fill': 'shopping-cart',
  'car.fill': 'directions-car',
  'fork.knife': 'restaurant',
  'cross.fill': 'local-hospital',
  'tv.fill': 'tv',
  'tshirt.fill': 'checkroom',
  'book.fill': 'school',
  'house.fill.2': 'home',
  'laptopcomputer': 'laptop',
  'airplane': 'flight',
  'pawprint.fill': 'pets',
  'gift.fill': 'card-giftcard',
  'briefcase.fill': 'work',
  'trendingup': 'trending-up',
  // UI
  'person.fill': 'person',
  'person.circle.fill': 'account-circle',
  'bell.fill': 'notifications',
  'gear': 'settings',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'magnifyingglass': 'search',
  'info.circle.fill': 'info',
  'exclamationmark.triangle.fill': 'warning',
  'star.fill': 'star',
  'heart.fill': 'favorite',
  'bolt.fill': 'bolt',
  'lock.fill': 'lock',
  'envelope.fill': 'email',
  'photo.fill': 'photo',
  'camera.fill': 'camera-alt',
  'arrow.clockwise': 'refresh',
  'arrow.left': 'arrow-back',
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
