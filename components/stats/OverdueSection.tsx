import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AntDesign } from '@expo/vector-icons';
import type { OverdueStatDto } from '@/types/workflow/stats.types';
import { SectionHeader } from './SectionHeader';
import { statsTheme } from './statsTheme';

export interface OverdueSectionProps {
  items: OverdueStatDto[];
}

export function OverdueSection({ items }: OverdueSectionProps) {
  const list = items ?? [];
  if (list.length === 0) return null;

  const totalOverdue = list.reduce((s, x) => s + (x.overdueCount ?? 0), 0);
  const totalCount = list.reduce((s, x) => s + (x.totalCount ?? 0), 0);
  const overallRate = totalCount > 0 ? (totalOverdue / totalCount) * 100 : 0;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="超期概况"
        description="超期实例数量与占比"
        icon="clock-circle"
        iconColor={statsTheme.colors.warning}
      />
      <View style={styles.summaryCard}>
        <HStack space="md" className="items-center justify-between">
          <HStack space="sm" className="items-center">
            <View style={[styles.iconWrap, { backgroundColor: `${statsTheme.colors.warning}20` }]}>
              <AntDesign name="exclamation-circle" size={20} color={statsTheme.colors.warning} />
            </View>
            <VStack space="xs">
              <Text style={styles.summaryLabel}>超期总数</Text>
              <Text style={styles.summaryValue}>{totalOverdue}</Text>
            </VStack>
          </HStack>
          <VStack className="items-end">
            <Text style={styles.rateLabel}>超期率</Text>
            <Text style={[styles.rateValue, overallRate > 0 && { color: statsTheme.colors.error }]}>
              {overallRate.toFixed(1)}%
            </Text>
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
                {item.definitionTitle || '全部'}
              </Text>
              <Text style={styles.meta}>
                超期 {item.overdueCount ?? 0} / 共 {item.totalCount ?? 0}
              </Text>
            </VStack>
            <Text
              style={[
                styles.rate,
                (item.overdueRate ?? 0) > 0 && { color: statsTheme.colors.error },
              ]}
            >
              {((item.overdueRate ?? 0) * 100).toFixed(1)}%
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
    width: 40,
    height: 40,
    borderRadius: statsTheme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 12, color: statsTheme.colors.text.tertiary },
  summaryValue: { fontSize: 20, fontWeight: '700', color: statsTheme.colors.text.primary },
  rateLabel: { fontSize: 12, color: statsTheme.colors.text.tertiary },
  rateValue: { fontSize: 18, fontWeight: '700', color: statsTheme.colors.text.secondary },
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
  rate: { fontSize: 14, fontWeight: '600', color: statsTheme.colors.text.secondary },
});
