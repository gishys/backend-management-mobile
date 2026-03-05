/**
 * 响应式布局设计 Token
 * 用于手机与平板适配，保证不同分辨率下的可读性与一致性
 */

/** 断点宽度（逻辑像素） */
export const BREAKPOINTS = {
  /** 平板竖屏 / 大手机 */
  tablet: 768,
  /** 平板横屏 / 小桌面 */
  desktop: 1024,
  /** 大屏桌面（内容最大宽度） */
  contentMax: 1200,
} as const;

/** 内容区最大宽度：平板及以上限制宽度并居中，避免过宽导致阅读困难 */
export const CONTENT_MAX_WIDTH = {
  /** 表单/详情等单栏内容 */
  form: 720,
  /** 列表/卡片流 */
  list: 960,
  /** 仪表盘/统计等宽内容 */
  dashboard: BREAKPOINTS.contentMax,
  /** 登录等窄表单 */
  auth: 440,
} as const;

/** 水平内边距：随屏幕增大适当增加，保持留白与呼吸感 */
export const HORIZONTAL_PADDING = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
} as const;

/** 区块间距 */
export const SECTION_SPACING = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
} as const;

/** 卡片/列表项间距 */
export const CARD_GAP = {
  mobile: 8,
  tablet: 12,
  desktop: 16,
} as const;

/** 根据宽度返回水平内边距 */
export function getHorizontalPadding(width: number): number {
  if (width >= BREAKPOINTS.desktop) return HORIZONTAL_PADDING.desktop;
  if (width >= BREAKPOINTS.tablet) return HORIZONTAL_PADDING.tablet;
  return HORIZONTAL_PADDING.mobile;
}

/** 根据宽度返回内容区最大宽度 */
export function getContentMaxWidth(
  width: number,
  type: keyof typeof CONTENT_MAX_WIDTH = 'list'
): number {
  const max = CONTENT_MAX_WIDTH[type];
  return width >= BREAKPOINTS.tablet ? Math.min(width, max) : width;
}
