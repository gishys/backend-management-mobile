import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AntDesign } from '@expo/vector-icons';
import { statsTheme } from './statsTheme';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof AntDesign.glyphMap;
  iconColor?: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  /** 是否使用渐变背景 */
  gradient?: boolean;
}

export function StatCard({
  title,
  value,
  icon = 'line-chart',
  iconColor = statsTheme.colors.primary,
  subtitle,
  trend,
  gradient = true,
}: StatCardProps) {
  const content = (
    <View style={styles.content}>
      <HStack space="md" className="items-center">
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
          <AntDesign name={icon} size={26} color={iconColor} />
        </View>
        <VStack space="xs" className="flex-1">
          <Text style={styles.label}>{title}</Text>
          <Heading size="xl" className="text-typography-900 font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Heading>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {trend != null ? (
            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor: trend.isPositive
                    ? statsTheme.colors.successBg
                    : statsTheme.colors.errorBg,
                },
              ]}
            >
              <AntDesign
                name={trend.isPositive ? 'arrow-up' : 'arrow-down'}
                size={10}
                color={trend.isPositive ? statsTheme.colors.success : statsTheme.colors.error}
              />
              <Text
                style={[
                  styles.trendText,
                  {
                    color: trend.isPositive
                      ? statsTheme.colors.success
                      : statsTheme.colors.error,
                  },
                ]}
              >
                {Math.abs(trend.value).toFixed(1)}%
              </Text>
            </View>
          ) : null}
        </VStack>
      </HStack>
    </View>
  );

  if (gradient) {
    return (
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={[`${iconColor}18`, `${iconColor}06`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {content}
        </LinearGradient>
      </View>
    );
  }

  return <View style={[styles.plainCard, statsTheme.shadowSm]}>{content}</View>;
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    marginHorizontal: statsTheme.spacing.xs,
    borderRadius: statsTheme.radius.md,
    overflow: 'hidden',
    ...statsTheme.shadow,
  },
  gradientCard: {
    padding: statsTheme.spacing.lg,
    borderRadius: statsTheme.radius.md,
  },
  plainCard: {
    flex: 1,
    marginHorizontal: statsTheme.spacing.xs,
    padding: statsTheme.spacing.lg,
    borderRadius: statsTheme.radius.md,
    backgroundColor: statsTheme.colors.card,
  },
  content: { flex: 1 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: statsTheme.colors.text.secondary,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    color: statsTheme.colors.text.tertiary,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: statsTheme.radius.sm,
    marginTop: 6,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});
