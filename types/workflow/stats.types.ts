/**
 * 工作流统计相关类型，与后端 Hx.Workflow.Application.Contracts 保持一致
 */

/** 统计查询通用参数 */
export interface StatsQueryInput {
  startTime?: string; // ISO 8601
  endTime?: string;
  definitionId?: string;
  creatorId?: string;
  /** day | week | month */
  granularity?: string;
  /** created | completed | both */
  trendType?: string;
  /** None | Definition | BusinessType */
  groupBy?: string;
}

/** 实例概览统计 */
export interface InstanceOverviewStatDto {
  totalCount: number;
  runningCount: number;
  completeCount: number;
  terminatedCount: number;
  suspendedCount: number;
}

/** 流程定义维度统计 */
export interface DefinitionStatDto {
  definitionId: string;
  title: string;
  version: number;
  totalCount: number;
  runningCount: number;
  completeCount: number;
  terminatedCount: number;
}

/** 超期统计 */
export interface OverdueStatDto {
  definitionId?: string;
  definitionTitle?: string;
  overdueCount: number;
  totalCount: number;
  overdueRate: number;
}

/** 趋势统计（按周期） */
export interface TrendStatDto {
  periodStart: string; // ISO 8601
  createdCount: number;
  completedCount: number;
}

/** 耗时统计（用于平均响应时间等） */
export interface DurationStatDto {
  definitionId?: string;
  definitionTitle?: string;
  businessType?: string;
  avgDurationMinutes: number;
  medianDurationMinutes: number;
  completedCount: number;
}

/** 仪表盘汇总：概览 + 按定义 Top N + 超期率 + 近期趋势 */
export interface DashboardStatDto {
  overview: InstanceOverviewStatDto;
  definitionTopN: DefinitionStatDto[];
  overdueSummary: OverdueStatDto[];
  recentTrend: TrendStatDto[];
}
