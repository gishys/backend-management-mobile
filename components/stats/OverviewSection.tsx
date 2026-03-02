import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { InstanceOverviewStatDto } from '@/types/workflow/stats.types';
import { SectionHeader } from './SectionHeader';
import { StatCard } from './StatCard';
import { statsTheme } from './statsTheme';

export interface OverviewSectionProps {
  data: InstanceOverviewStatDto | null | undefined;
}

const OVERVIEW_ITEMS: Array<{
  key: keyof InstanceOverviewStatDto;
  title: string;
  icon: 'database' | 'reload' | 'check-circle' | 'close-circle' | 'pause-circle';
  color: string;
}> = [
  { key: 'totalCount', title: '实例总数', icon: 'database', color: statsTheme.colors.primary },
  { key: 'runningCount', title: '运行中', icon: 'reload', color: statsTheme.colors.warning },
  { key: 'completeCount', title: '已完成', icon: 'check-circle', color: statsTheme.colors.success },
  { key: 'terminatedCount', title: '已终止', icon: 'close-circle', color: statsTheme.colors.error },
  { key: 'suspendedCount', title: '已挂起', icon: 'pause-circle', color: statsTheme.colors.purple },
];

export function OverviewSection({ data }: OverviewSectionProps) {
  if (!data) return null;

  const total = data.totalCount ?? 0;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="实例概览"
        description="流程实例状态分布"
        icon="pie-chart"
        iconColor={statsTheme.colors.primary}
      />
      <View style={styles.grid}>
        {OVERVIEW_ITEMS.map((item, index) => {
          const value = Number(data[item.key]) ?? 0;
          const subtitle =
            total > 0 && item.key !== 'totalCount'
              ? `占比 ${((value / total) * 100).toFixed(0)}%`
              : undefined;
          return (
            <View key={item.key} style={index % 2 === 0 ? styles.cardLeft : styles.cardRight}>
              <StatCard
                title={item.title}
                value={value}
                icon={item.icon}
                iconColor={item.color}
                subtitle={subtitle}
                gradient
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: statsTheme.spacing.section },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -statsTheme.spacing.xs,
  },
  cardLeft: {
    width: '50%',
    paddingHorizontal: statsTheme.spacing.xs,
    marginBottom: statsTheme.spacing.md,
  },
  cardRight: {
    width: '50%',
    paddingHorizontal: statsTheme.spacing.xs,
    marginBottom: statsTheme.spacing.md,
  },
});
