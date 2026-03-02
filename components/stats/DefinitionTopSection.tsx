import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AntDesign } from '@expo/vector-icons';
import type { DefinitionStatDto } from '@/types/workflow/stats.types';
import { SectionHeader } from './SectionHeader';
import { statsTheme } from './statsTheme';

export interface DefinitionTopSectionProps {
  items: DefinitionStatDto[];
  maxItems?: number;
}

export function DefinitionTopSection({ items, maxItems = 10 }: DefinitionTopSectionProps) {
  const list = (items ?? []).slice(0, maxItems);
  if (list.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="流程定义 Top"
        description="按实例数量排序的流程定义"
        icon="bar-chart"
        iconColor={statsTheme.colors.primary}
      />
      <View style={styles.list}>
        {list.map((item, index) => (
          <View
            key={item.definitionId ?? index}
            style={[styles.row, index < list.length - 1 && styles.rowBorder]}
          >
            <HStack space="md" className="flex-1 items-center">
              <View style={styles.indexWrap}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
              <VStack space="xs" className="flex-1">
                <Text style={styles.title} numberOfLines={1}>
                  {item.title || '未命名'}
                </Text>
                <Text style={styles.meta}>v{item.version ?? '-'}</Text>
              </VStack>
              <VStack space="xs" className="items-end">
                <Text style={styles.count}>{item.totalCount ?? 0}</Text>
                <Text style={styles.hint}>
                  运行 {item.runningCount ?? 0} / 完成 {item.completeCount ?? 0}
                </Text>
              </VStack>
            </HStack>
          </View>
        ))}
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
    paddingVertical: statsTheme.spacing.md,
    paddingHorizontal: statsTheme.spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: statsTheme.colors.border,
  },
  indexWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: statsTheme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 12,
    fontWeight: '600',
    color: statsTheme.colors.primary,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: statsTheme.colors.text.primary,
  },
  meta: {
    fontSize: 12,
    color: statsTheme.colors.text.tertiary,
  },
  count: {
    fontSize: 16,
    fontWeight: '700',
    color: statsTheme.colors.primary,
  },
  hint: {
    fontSize: 11,
    color: statsTheme.colors.text.tertiary,
  },
});
