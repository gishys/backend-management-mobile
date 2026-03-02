/**
 * 统计模块设计 Token：色彩、间距、圆角、阴影等集中管理，便于维护与主题一致
 */
import { Platform } from 'react-native';

export const statsTheme = {
  colors: {
    primary: '#1890FF',
    primaryBg: '#E6F7FF',
    success: '#52c41a',
    successBg: '#f6ffed',
    warning: '#FA8C16',
    warningBg: '#fff7e6',
    error: '#ff4d4f',
    errorBg: '#fff1f0',
    purple: '#722ed1',
    purpleBg: '#f9f0ff',
    text: {
      primary: '#262626',
      secondary: '#595959',
      tertiary: '#8c8c8c',
    },
    border: '#e8e8e8',
    background: '#f5f5f5',
    card: '#ffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    section: 24,
    page: 16,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    android: { elevation: 3 },
    web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' as any },
  }) as object,
  shadowSm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
    },
    android: { elevation: 2 },
    web: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' as any },
  }) as object,
} as const;

export type StatsTheme = typeof statsTheme;
