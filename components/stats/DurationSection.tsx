import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AntDesign } from '@expo/vector-icons';
import type { DurationStatDto } from '@/types/workflow/stats.types';
import { SectionHeader } from './SectionHeader';
import { statsTheme } from './statsTheme';

export interface DurationSectionProps {
  items: DurationStatDto[];
}

function formatMinutes(min: number): string {
  if (min < 1) return `${Math.round(min * 60)} 秒`;
  if (min < 60) return `${min.toFixed(1)} 分钟`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h} 小时 ${m} 分钟` : `${h} 小时`;
}

export function DurationSection({ items }: DurationSectionProps) {
  const list = items ?? [];
  if (list.length === 0) return null;

  const avgAll =
    list.length > 0
      ? list.reduce((s, d) => s + (d.avgDurationMinutes ?? 0), 0) / list.length
      : 0;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="平均耗时"
        description="流程完成平均耗时（按定义）"
        icon="dashboard"
        iconColor={statsTheme.colors.primary}
      />
      <View style={styles.summaryCard}>
        <HStack space="md" className="items-center">
          <View style={[styles.iconWrap, { backgroundColor: `${statsTheme.colors.primary}18` }]}>
            <AntDesign name="clock-circle" size={22} color={statsTheme.colors.primary} />
          </View>
          <VStack space="xs">
            <Text style={styles.summaryLabel}>整体平均</Text>
            <Text style={styles.summaryValue}>{formatMinutes(avgAll)}</Text>
          </VStack>
        </HStack>
      </View>
      <View style={styles.list}>
        {list.map((item, index) => (
          <View
            key={item.definitionId ?? item.definitionTitle ?? index}
            style={[styles.row, index < list.length - 1 && styles.rowBorder]}
          >
            <VStack space="xs" className="flex-1">
              <Text style={styles.title} numberOfLines={1}>
                {item.definitionTitle || item.businessType || '未命名'}
              </Text>
              <Text style={styles.meta}>完成 {item.completedCount ?? 0} 件</Text>
            </VStack>
            <Text style={styles.duration}>
              {formatMinutes(item.avgDurationMinutes ?? 0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: statsTheme.spacing.section },
  summaryCard: {
    backgroundColor: statsTheme.colors.card,
    borderRadius: statsTheme.radius.md,
    padding: statsTheme.spacing.lg,
    marginBottom: statsTheme.spacing.md,
    ...statsTheme.shadowSm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: statsTheme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 12, color: statsTheme.colors.text.tertiary },
  summaryValue: { fontSize: 18, fontWeight: '700', color: statsTheme.colors.text.primary },
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
  title: { fontSize: 14, fontWeight: '500', color: statsTheme.colors.text.primary },
  meta: { fontSize: 12, color: statsTheme.colors.text.tertiary },
  duration: { fontSize: 14, fontWeight: '600', color: statsTheme.colors.primary },
});
