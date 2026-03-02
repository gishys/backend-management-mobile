import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TrendStatDto } from '@/types/workflow/stats.types';
import { SectionHeader } from './SectionHeader';
import { statsTheme } from './statsTheme';

export interface RecentTrendSectionProps {
  items: TrendStatDto[];
}

function formatPeriodStart(periodStart: string): string {
  try {
    const d = typeof periodStart === 'string' ? parseISO(periodStart) : new Date(periodStart);
    return format(d, 'yyyy-MM', { locale: zhCN });
  } catch {
    return String(periodStart).slice(0, 7);
  }
}

export function RecentTrendSection({ items }: RecentTrendSectionProps) {
  const list = items ?? [];
  if (list.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="近期趋势"
        description="按周期统计的创建与完成数量"
        icon="line-chart"
        iconColor={statsTheme.colors.primary}
      />
      <View style={styles.list}>
        {list.map((item, index) => {
          const created = item.createdCount ?? 0;
          const completed = item.completedCount ?? 0;
          return (
            <View
              key={item.periodStart ?? index}
              style={[styles.row, index < list.length - 1 && styles.rowBorder]}
            >
              <Text style={styles.period}>{formatPeriodStart(item.periodStart)}</Text>
              <HStack space="lg" className="flex-1 justify-end">
                <VStack className="items-end">
                  <Text style={styles.hint}>创建</Text>
                  <Text style={styles.countPrimary}>{created}</Text>
                </VStack>
                <VStack className="items-end">
                  <Text style={styles.hint}>完成</Text>
                  <Text style={styles.countSuccess}>{completed}</Text>
                </VStack>
              </HStack>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: statsTheme.spacing.section },
  list: {
    backgroundColor: statsTheme.colors.card,
    borderRadius: statsTheme.radius.md,
    overflow: 'hidden',
    ...statsTheme.shadowSm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: statsTheme.spacing.md,
    paddingHorizontal: statsTheme.spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: statsTheme.colors.border,
  },
  period: {
    fontSize: 14,
    fontWeight: '600',
    color: statsTheme.colors.text.primary,
  },
  hint: { fontSize: 11, color: statsTheme.colors.text.tertiary },
  countPrimary: { fontSize: 16, fontWeight: '700', color: statsTheme.colors.primary },
  countSuccess: { fontSize: 16, fontWeight: '700', color: statsTheme.colors.success },
});
