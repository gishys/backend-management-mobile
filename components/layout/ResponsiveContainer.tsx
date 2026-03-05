import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive, ContentWidthType } from '@/hooks/useResponsive';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  /** 内容类型，决定最大宽度 */
  type?: ContentWidthType;
  /** 是否限制最大宽度并居中（平板及以上） */
  constrain?: boolean;
  /** 额外样式 */
  style?: ViewStyle;
  /** 内容区样式 */
  contentStyle?: ViewStyle;
}

/**
 * 响应式内容容器
 * 平板及以上时限制最大宽度并水平居中，保持留白与可读性
 */
export function ResponsiveContainer({
  children,
  type = 'list',
  constrain = true,
  style,
  contentStyle,
}: ResponsiveContainerProps) {
  const {
    width,
    horizontalPadding,
    contentMaxWidthForm,
    contentMaxWidthList,
    contentMaxWidthDashboard,
    contentMaxWidthAuth,
    isTablet,
  } = useResponsive();

  const maxWidth =
    type === 'form'
      ? contentMaxWidthForm
      : type === 'dashboard'
        ? contentMaxWidthDashboard
        : type === 'auth'
          ? contentMaxWidthAuth
          : contentMaxWidthList;

  const shouldConstrain = constrain && isTablet && width > maxWidth;

  return (
    <View style={[styles.outer, style]}>
      <View
        style={[
          styles.inner,
          { paddingHorizontal: horizontalPadding },
          shouldConstrain && { maxWidth, alignSelf: 'center', width: '100%' },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
});
