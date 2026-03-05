import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';
import {
  BREAKPOINTS,
  getHorizontalPadding,
  getContentMaxWidth,
  CONTENT_MAX_WIDTH,
} from '@/constants/layout';

export type ContentWidthType = keyof typeof CONTENT_MAX_WIDTH;

export interface ResponsiveValues {
  /** 窗口宽度 */
  width: number;
  /** 窗口高度 */
  height: number;
  /** 是否平板及以上（宽度 >= 768） */
  isTablet: boolean;
  /** 是否大平板/桌面（宽度 >= 1024） */
  isDesktop: boolean;
  /** 当前水平内边距 */
  horizontalPadding: number;
  /** 内容区最大宽度（表单） */
  contentMaxWidthForm: number;
  /** 内容区最大宽度（列表） */
  contentMaxWidthList: number;
  /** 内容区最大宽度（仪表盘） */
  contentMaxWidthDashboard: number;
  /** 内容区最大宽度（登录） */
  contentMaxWidthAuth: number;
  /** 列表/卡片建议列数（平板 2 列，桌面可 3 列） */
  cardColumns: number;
}

/**
 * 响应式布局钩子
 * 根据窗口宽度返回断点与布局相关值，供页面与组件适配平板与桌面
 */
export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isTablet = width >= BREAKPOINTS.tablet;
    const isDesktop = width >= BREAKPOINTS.desktop;
    const horizontalPadding = getHorizontalPadding(width);
    const contentMaxWidthForm = getContentMaxWidth(width, 'form');
    const contentMaxWidthList = getContentMaxWidth(width, 'list');
    const contentMaxWidthDashboard = getContentMaxWidth(width, 'dashboard');
    const contentMaxWidthAuth = getContentMaxWidth(width, 'auth');
    const cardColumns = isDesktop ? 3 : isTablet ? 2 : 1;

    return {
      width,
      height,
      isTablet,
      isDesktop,
      horizontalPadding,
      contentMaxWidthForm,
      contentMaxWidthList,
      contentMaxWidthDashboard,
      contentMaxWidthAuth,
      cardColumns,
    };
  }, [width, height]);
}
