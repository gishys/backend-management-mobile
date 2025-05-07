import apiClient from '@/api/client';
import { PagedResultDto, PaginationParams } from '@/types/page.types';
import { ProcessInstance } from '@/types/workflow/instance/processInstance.types';

export const fetchMyWkInstances = async (
  params: Record<string, any> & PaginationParams,
): Promise<PagedResultDto<ProcessInstance>> => {
  const response = await apiClient.get<PagedResultDto<ProcessInstance>>(
    '/hxworkflow/workflow/mywkinstances',
    { params },
  );
  return response.data;
};
