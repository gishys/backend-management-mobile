/**
 * 登录页设计 Token：色彩、间距、圆角、阴影集中管理，便于维护与主题一致
 */
import { Platform, ViewStyle } from 'react-native';
import { createShadowStyle } from '@/utils/shadowStyles';

export const loginTheme = {
  /** 渐变色（用于背景、主按钮） */
  gradient: {
    start: '#667eea',
    end: '#764ba2',
  },
  /** 主色与语义色 */
  colors: {
    primary: '#667eea',
    surface: 'rgba(255, 255, 255, 0.2)',
    surfaceBorder: 'rgba(255, 255, 255, 0.3)',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textMuted: 'rgba(255, 255, 255, 0.6)',
    error: '#fecaca',
    errorText: '#fef2f2',
    icon: '#ffffff',
    checkboxBorder: 'rgba(255, 255, 255, 0.6)',
    checkboxChecked: 'rgba(255, 255, 255, 0.3)',
    checkboxBorderChecked: '#ffffff',
  },
  /** 间距（8px 基准） */
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    section: 32,
    pageHorizontal: 24,
    pageVertical: 40,
  },
  /** 圆角 */
  radius: {
    input: 12,
    button: 26,
    logo: 50,
    checkbox: 4,
  },
  /** 尺寸 */
  size: {
    logo: 100,
    logoIcon: 48,
    inputHeight: 52,
    checkbox: 20,
    checkboxIcon: 16,
  },
  /** 阴影：卡片/输入框 */
  shadowCard: createShadowStyle(
    'rgba(0,0,0,0.15)',
    { width: 0, height: 4 },
    0.12,
    12,
    4
  ) as ViewStyle,
  /** 阴影：按钮 */
  shadowButton: createShadowStyle(
    'rgba(102, 126, 234, 0.4)',
    { width: 0, height: 4 },
    0.3,
    8,
    4
  ) as ViewStyle,
} as const;

export type LoginTheme = typeof loginTheme;
