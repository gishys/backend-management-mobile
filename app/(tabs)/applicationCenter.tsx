import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RouteGuard from '@/components/Common/RouteGuard';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

// 统计数据接口
interface OnlineStatistics {
  totalUsers: number; // 在线用户总数
  activeUsers: number; // 活跃用户数
  pendingTasks: number; // 待办任务数
  completedTasks: number; // 已完成任务数
  newUsersToday?: number; // 今日新增用户
  avgResponseTime?: number; // 平均响应时间（分钟）
}

interface BusinessStatistics {
  todayCount: number; // 今日业务量
  weekCount: number; // 本周业务量
  monthCount: number; // 本月业务量
  totalCount: number; // 总业务量
  todayGrowth: number; // 今日增长率（百分比）
  weekGrowth: number; // 本周增长率（百分比）
  monthGrowth?: number; // 本月增长率（百分比）
  avgDailyCount?: number; // 日均业务量
}

interface StatisticsData {
  online: OnlineStatistics;
  business: BusinessStatistics;
  lastUpdated: string; // 最后更新时间
}

// 统计卡片组件 - 优化样式
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  iconFamily: 'AntDesign' | 'MaterialIcons';
  iconColor: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: boolean;
}> = ({ title, value, icon, iconFamily, iconColor, subtitle, trend, gradient = false }) => {
  const IconComponent = iconFamily === 'AntDesign' ? AntDesign : MaterialIcons;

  const cardContent = (
    <View style={styles.cardContent}>
      <HStack space="md" className="items-center">
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${iconColor}20` },
          ]}
        >
          <IconComponent name={icon as any} size={28} color={iconColor} />
        </View>
        <VStack space="xs" className="flex-1">
          <Text className="text-xs text-typography-600 font-medium">{title}</Text>
          <Heading size="xl" className="text-typography-900 font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Heading>
          {subtitle && (
            <Text className="text-xs text-typography-500 mt-1">{subtitle}</Text>
          )}
          {trend && (
            <HStack space="xs" className="items-center mt-2">
              <View
                style={[
                  styles.trendBadge,
                  {
                    backgroundColor: trend.isPositive
                      ? '#f6ffed'
                      : '#fff1f0',
                  },
                ]}
              >
                <AntDesign
                  name={trend.isPositive ? 'arrow-up' : 'arrow-down'}
                  size={10}
                  color={trend.isPositive ? '#52c41a' : '#ff4d4f'}
                />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{
                    color: trend.isPositive ? '#52c41a' : '#ff4d4f',
                  }}
                >
                  {Math.abs(trend.value).toFixed(1)}%
                </Text>
              </View>
            </HStack>
          )}
        </VStack>
      </HStack>
    </View>
  );

  if (gradient) {
    return (
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={[`${iconColor}15`, `${iconColor}05`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {cardContent}
        </LinearGradient>
      </View>
    );
  }

  return (
    <Card className="p-4 rounded-xl flex-1 m-1" style={styles.card}>
      {cardContent}
    </Card>
  );
};

// 统计模块标题组件 - 优化样式
const SectionHeader: React.FC<{ title: string; icon: string; description?: string }> = ({
  title,
  icon,
  description,
}) => (
  <View style={styles.sectionHeader}>
    <HStack space="md" className="items-center">
      <View style={styles.headerIconContainer}>
        <AntDesign name={icon as any} size={24} color="#1890FF" />
      </View>
      <VStack space="xs" className="flex-1">
        <Heading size="lg" className="text-typography-900 font-bold">
          {title}
        </Heading>
        {description && (
          <Text className="text-xs text-typography-500">{description}</Text>
        )}
      </VStack>
    </HStack>
  </View>
);

// 趋势图表卡片组件
const TrendCard: React.FC<{
  title: string;
  value: number;
  growth?: number;
  unit?: string;
}> = ({ title, value, growth, unit = '' }) => {
  const hasGrowth = growth !== undefined;
  const isPositive = hasGrowth && growth > 0;

  return (
    <View style={styles.trendCard}>
      <HStack space="md" className="items-center justify-between">
        <Text className="text-sm text-typography-600 font-medium">{title}</Text>
        <HStack space="sm" className="items-center">
          <Text className="text-base font-bold text-typography-900">
            {value.toLocaleString()}
            {unit}
          </Text>
          {hasGrowth && (
            <View
              style={[
                styles.trendBadge,
                {
                  backgroundColor: isPositive ? '#f6ffed' : '#fff1f0',
                },
              ]}
            >
              <AntDesign
                name={isPositive ? 'arrow-up' : 'arrow-down'}
                size={10}
                color={isPositive ? '#52c41a' : '#ff4d4f'}
              />
              <Text
                className="text-xs font-semibold ml-1"
                style={{
                  color: isPositive ? '#52c41a' : '#ff4d4f',
                }}
              >
                {Math.abs(growth).toFixed(1)}%
              </Text>
            </View>
          )}
        </HStack>
      </HStack>
    </View>
  );
};

export default function ApplicationCenter() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 数据加载函数 - 使用 useCallback 优化
  const loadStatistics = useCallback(
    async (isRefreshing = false) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        // TODO: 替换为实际的 API 调用
        // const response = await fetchStatistics();
        
        // 模拟 API 延迟
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 模拟数据 - 添加更多数据
        const mockData: StatisticsData = {
          online: {
            totalUsers: 1250,
            activeUsers: 856,
            pendingTasks: 342,
            completedTasks: 1856,
            newUsersToday: 23,
            avgResponseTime: 2.5,
          },
          business: {
            todayCount: 156,
            weekCount: 1089,
            monthCount: 4523,
            totalCount: 125680,
            todayGrowth: 12.5,
            weekGrowth: 8.3,
            monthGrowth: 15.2,
            avgDailyCount: 145,
          },
          lastUpdated: new Date().toISOString(),
        };

        setStatistics(mockData);
        setLastUpdated(new Date());
      } catch (error: any) {
        console.error('加载统计数据失败:', error);
        
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          '加载数据失败，请稍后重试';
        
        toast.show({
          placement: 'top',
          duration: 3000,
          render: ({ id }) => {
            return (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <ToastTitle>加载失败</ToastTitle>
                <ToastDescription>{errorMessage}</ToastDescription>
              </Toast>
            );
          },
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  const onRefresh = useCallback(() => {
    loadStatistics(true);
  }, [loadStatistics]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // 计算活跃用户占比 - 使用 useMemo 优化
  const activeUserPercentage = useMemo(() => {
    if (!statistics?.online.totalUsers) return 0;
    return Math.round(
      (statistics.online.activeUsers / statistics.online.totalUsers) * 100,
    );
  }, [statistics]);

  // 计算任务完成率 - 使用 useMemo 优化
  const taskCompletionRate = useMemo(() => {
    if (!statistics?.online.pendingTasks && !statistics?.online.completedTasks) return 0;
    const total = statistics.online.pendingTasks + statistics.online.completedTasks;
    if (total === 0) return 0;
    return Math.round((statistics.online.completedTasks / total) * 100);
  }, [statistics]);

  if (loading && !statistics) {
    return (
      <RouteGuard>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1890FF" />
            <Text className="mt-4 text-typography-600">加载中...</Text>
          </View>
        </View>
      </RouteGuard>
    );
  }

  const renderContent = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          {...(Platform.OS !== 'web' && { colors: ['#1890FF'] })}
        />
      }
    >
      {/* 在线统计模块 */}
      <View style={styles.section}>
        <SectionHeader
          title="在线统计"
          icon="line-chart"
          description="实时监控系统运行状态"
        />
        <View style={styles.cardRow}>
          <StatCard
            title="在线用户"
            value={statistics?.online.totalUsers || 0}
            icon="user"
            iconFamily="AntDesign"
            iconColor="#1890FF"
            subtitle={`活跃: ${statistics?.online.activeUsers || 0} 人`}
            gradient
          />
          <StatCard
            title="待办任务"
            value={statistics?.online.pendingTasks || 0}
            icon="clock-circle"
            iconFamily="AntDesign"
            iconColor="#FF9800"
            subtitle={`完成率: ${taskCompletionRate}%`}
            gradient
          />
        </View>
        <View style={styles.cardRow}>
          <StatCard
            title="已完成"
            value={statistics?.online.completedTasks || 0}
            icon="check-circle"
            iconFamily="AntDesign"
            iconColor="#52c41a"
            subtitle={`今日新增: ${statistics?.online.newUsersToday || 0}`}
            gradient
          />
          <StatCard
            title="活跃用户"
            value={statistics?.online.activeUsers || 0}
            icon="team"
            iconFamily="AntDesign"
            iconColor="#722ed1"
            subtitle={`占比: ${activeUserPercentage}%`}
            trend={
              statistics?.online.avgResponseTime
                ? {
                    value: 5.2,
                    isPositive: true,
                  }
                : undefined
            }
            gradient
          />
        </View>

        {/* 额外统计信息 */}
        {statistics?.online.avgResponseTime && (
          <Card className="p-4 rounded-xl mt-2" style={styles.infoCard}>
            <HStack space="md" className="items-center justify-between">
              <HStack space="sm" className="items-center">
                <MaterialIcons name="speed" size={20} color="#1890FF" />
                <Text className="text-sm text-typography-600">平均响应时间</Text>
              </HStack>
              <Text className="text-base font-bold text-typography-900">
                {statistics.online.avgResponseTime} 分钟
              </Text>
            </HStack>
          </Card>
        )}
      </View>

      {/* 业务量统计模块 */}
      <View style={styles.section}>
        <SectionHeader
          title="业务量统计"
          icon="barschart"
          description="业务处理量趋势分析"
        />
        <View style={styles.cardRow}>
          <StatCard
            title="今日业务"
            value={statistics?.business.todayCount || 0}
            icon="calendar"
            iconFamily="AntDesign"
            iconColor="#1890FF"
            trend={
              statistics?.business.todayGrowth
                ? {
                    value: statistics.business.todayGrowth,
                    isPositive: statistics.business.todayGrowth > 0,
                  }
                : undefined
            }
            gradient
          />
          <StatCard
            title="本周业务"
            value={statistics?.business.weekCount || 0}
            icon="calendar"
            iconFamily="AntDesign"
            iconColor="#52c41a"
            trend={
              statistics?.business.weekGrowth
                ? {
                    value: statistics.business.weekGrowth,
                    isPositive: statistics.business.weekGrowth > 0,
                  }
                : undefined
            }
            gradient
          />
        </View>
        <View style={styles.cardRow}>
          <StatCard
            title="本月业务"
            value={statistics?.business.monthCount || 0}
            icon="calendar"
            iconFamily="AntDesign"
            iconColor="#722ed1"
            trend={
              statistics?.business.monthGrowth
                ? {
                    value: statistics.business.monthGrowth,
                    isPositive: statistics.business.monthGrowth > 0,
                  }
                : undefined
            }
            gradient
          />
          <StatCard
            title="总业务量"
            value={statistics?.business.totalCount || 0}
            icon="database"
            iconFamily="AntDesign"
            iconColor="#ff4d4f"
            subtitle={`日均: ${statistics?.business.avgDailyCount || 0}`}
            gradient
          />
        </View>

        {/* 业务量趋势信息 - 优化样式 */}
        <Card className="p-5 rounded-xl mt-3" style={styles.trendCardContainer}>
          <VStack space="md">
            <HStack space="sm" className="items-center mb-2">
              <AntDesign name="line-chart" size={18} color="#1890FF" />
              <Text className="text-base font-bold text-typography-900">
                业务趋势分析
              </Text>
            </HStack>
            <View style={styles.divider} />
            <TrendCard
              title="今日"
              value={statistics?.business.todayCount || 0}
              growth={statistics?.business.todayGrowth}
            />
            <TrendCard
              title="本周"
              value={statistics?.business.weekCount || 0}
              growth={statistics?.business.weekGrowth}
            />
            <TrendCard
              title="本月"
              value={statistics?.business.monthCount || 0}
              growth={statistics?.business.monthGrowth}
            />
            <View style={styles.divider} />
            <HStack
              space="md"
              className="items-center justify-between"
              style={styles.totalRow}
            >
              <HStack space="sm" className="items-center">
                <AntDesign name="database" size={18} color="#1890FF" />
                <Text className="text-base font-bold text-typography-900">
                  累计总量
                </Text>
              </HStack>
              <Text className="text-xl font-bold" style={styles.totalValue}>
                {statistics?.business.totalCount.toLocaleString() || 0}
              </Text>
            </HStack>
          </VStack>
        </Card>
      </View>

      {/* 更新时间 */}
      <View style={styles.footer}>
        <HStack space="xs" className="items-center justify-center">
          <AntDesign name="clock-circle" size={12} color="#999" />
          <Text className="text-xs text-typography-500">
            最后更新: {format(lastUpdated, 'yyyy-MM-dd HH:mm:ss')}
          </Text>
        </HStack>
      </View>
    </ScrollView>
  );

  return (
    <RouteGuard>
      <View style={styles.container}>{renderContent()}</View>
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  gradientCard: {
    padding: 16,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  infoCard: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      },
    }),
  },
  trendCardContainer: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  trendCard: {
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 8,
  },
  totalRow: {
    paddingTop: 4,
  },
  totalValue: {
    color: '#1890FF',
  },
  footer: {
    marginTop: 24,
    paddingVertical: 16,
  },
});
