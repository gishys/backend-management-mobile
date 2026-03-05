import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { format } from 'date-fns';
import { AntDesign } from '@expo/vector-icons';
import RouteGuard from '@/components/Common/RouteGuard';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { getStatsDashboard, getStatsDuration } from '@/api/workflow/stats';
import type { DashboardStatDto, DurationStatDto } from '@/types/workflow/stats.types';
import {
  statsTheme,
  OverviewSection,
  DefinitionTopSection,
  OverdueSection,
  RecentTrendSection,
  DurationSection,
} from '@/components/stats';
import { ResponsiveContainer } from '@/components/layout';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * 应用中心 - 工作流统计仪表盘
 * 数据来源：GET /hxworkflow/workflow/stats/dashboard、GET .../stats/duration
 * 页面结构按后端 DTO 设计：实例概览、流程定义 Top、超期概况、近期趋势、平均耗时
 */
export default function ApplicationCenter() {
  const toast = useToast();
  const { horizontalPadding } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardStatDto | null>(null);
  const [durationList, setDurationList] = useState<DurationStatDto[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(
    async (isRefreshing = false) => {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      try {
        const [dashboardRes, durationRes] = await Promise.all([
          getStatsDashboard(),
          getStatsDuration(),
        ]);

        setDashboard(dashboardRes ?? null);
        setDurationList(durationRes ?? []);
        setLastUpdated(new Date());
      } catch (error: any) {
        const message =
          error?.response?.data?.message ??
          error?.message ??
          '加载统计数据失败，请稍后重试';
        toast.show({
          placement: 'top',
          duration: 3000,
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>加载失败</ToastTitle>
              <ToastDescription>{message}</ToastDescription>
            </Toast>
          ),
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  const onRefresh = useCallback(() => loadData(true), [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !dashboard) {
    return (
      <RouteGuard>
        <View style={styles.container}>
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={statsTheme.colors.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        </View>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard>
      <ResponsiveContainer type="dashboard" style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              {...(Platform.OS !== 'web' && { colors: [statsTheme.colors.primary] })}
            />
          }
        >
          <OverviewSection data={dashboard?.overview} />
          <DefinitionTopSection items={dashboard?.definitionTopN ?? []} />
          <OverdueSection items={dashboard?.overdueSummary ?? []} />
          <RecentTrendSection items={dashboard?.recentTrend ?? []} />
          <DurationSection items={durationList} />

          {lastUpdated && (
            <View style={styles.footer}>
              <AntDesign name="clock-circle" size={12} color={statsTheme.colors.text.tertiary} />
              <Text style={styles.footerText}>
                最后更新：{format(lastUpdated, 'yyyy-MM-dd HH:mm')}
              </Text>
            </View>
          )}
        </ScrollView>
      </ResponsiveContainer>
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: statsTheme.colors.background,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: statsTheme.spacing.page,
    paddingBottom: 32,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: statsTheme.spacing.lg,
    fontSize: 14,
    color: statsTheme.colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: statsTheme.spacing.section,
    paddingVertical: statsTheme.spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: statsTheme.colors.text.tertiary,
  },
});
