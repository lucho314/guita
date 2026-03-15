import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#6C63FF';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    surface: '#F5F5F5',
    border: '#E0E0E0',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    muted: '#6B7280',
    accent: '#6C63FF',
    textSecondary: '#6B7280',
    income: '#22C55E',
    expense: '#EF4444',
    card: '#FFFFFF',
    cardBorder: '#E0E0E0',
    surface2: '#F0F0F0',
    accentLight: '#8B84FF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0A0E1A',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    surface: '#111827',
    surface2: '#1F2937',
    border: '#1F2937',
    success: '#22C55E',
    danger: '#EF4444',
    warning: '#F59E0B',
    muted: '#6B7280',
    accent: '#6C63FF',
    accentLight: '#8B84FF',
    card: '#151E2D',
    cardBorder: '#1E293B',
    textSecondary: '#9CA3AF',
    income: '#22C55E',
    expense: '#EF4444',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
