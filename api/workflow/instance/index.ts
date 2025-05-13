import apiClient from '@/api/client';
import { PagedResultDto, PaginationParams } from '@/types/page.types';
import {
  ProcessInstance,
  WorkflowInstance,
} from '@/types/workflow/instance/processInstance.types';

export const fetchMyWkInstances = async (
  params: Record<string, any> & PaginationParams,
): Promise<PagedResultDto<ProcessInstance>> => {
  const response = await apiClient.get<PagedResultDto<ProcessInstance>>(
    '/hxworkflow/workflow/mywkinstances',
    { params },
  );
  return response.data;
};

export const fetchMyWkInstance = async (params: {
  workflowId: string;
  pointerId?: string;
}): Promise<WorkflowInstance | { error?: { message?: string } }> => {
  const response = await apiClient.get<
    WorkflowInstance | { error?: { message?: string } }
  >('/hxworkflow/workflow/workflowinstance', { params });
  return response.data;
};
