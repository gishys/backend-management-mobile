/**
 * 工作流统计 API - 对接后端 HxWorkflowController 统计接口
 * 路由前缀: /hxworkflow (与 client baseURL 拼接)
 */
import apiClient from '@/api/client';
import type {
  DashboardStatDto,
  InstanceOverviewStatDto,
  StatsQueryInput,
  DurationStatDto,
  TrendStatDto,
} from '@/types/workflow/stats.types';

const STATS_BASE = '/hxworkflow/workflow/stats';

/** 查询参数：仅传有值的字段，便于后端解析 */
function toQueryParams(input?: StatsQueryInput | null): Record<string, string> {
  if (!input) return {};
  const params: Record<string, string> = {};
  if (input.startTime) params.startTime = input.startTime;
  if (input.endTime) params.endTime = input.endTime;
  if (input.definitionId) params.definitionId = input.definitionId;
  if (input.creatorId) params.creatorId = input.creatorId;
  if (input.granularity) params.granularity = input.granularity;
  if (input.trendType) params.trendType = input.trendType;
  if (input.groupBy) params.groupBy = input.groupBy;
  return params;
}

/**
 * 获取统计概览（实例总数、运行中、已完成等）
 * GET /hxworkflow/workflow/stats/overview
 */
export async function getStatsOverview(
  params?: StatsQueryInput | null,
): Promise<InstanceOverviewStatDto> {
  const { data } = await apiClient.get<InstanceOverviewStatDto>(
    `${STATS_BASE}/overview`,
    { params: toQueryParams(params) },
  );
  return data;
}

/**
 * 获取仪表盘汇总（概览 + 按定义 TopN + 超期 + 近期趋势）
 * GET /hxworkflow/workflow/stats/dashboard
 */
export async function getStatsDashboard(
  params?: StatsQueryInput | null,
): Promise<DashboardStatDto> {
  const { data } = await apiClient.get<DashboardStatDto>(
    `${STATS_BASE}/dashboard`,
    { params: toQueryParams(params) },
  );
  return data;
}

/**
 * 获取趋势统计（按日/周/月粒度）
 * GET /hxworkflow/workflow/stats/trend
 */
export async function getStatsTrend(
  params?: StatsQueryInput | null,
): Promise<TrendStatDto[]> {
  const { data } = await apiClient.get<TrendStatDto[]>(
    `${STATS_BASE}/trend`,
    { params: toQueryParams(params) },
  );
  return data ?? [];
}

/**
 * 获取耗时统计（用于平均响应时间等）
 * GET /hxworkflow/workflow/stats/duration
 */
export async function getStatsDuration(
  params?: StatsQueryInput | null,
): Promise<DurationStatDto[]> {
  const { data } = await apiClient.get<DurationStatDto[]>(
    `${STATS_BASE}/duration`,
    { params: toQueryParams(params) },
  );
  return data ?? [];
}
