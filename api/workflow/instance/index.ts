import apiClient from '@/api/client';
import { PagedResultDto, PaginationParams } from '@/types/page.types';
import {
  AttachCatalogue,
  AttachCatalogueCreateDto,
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

/**创建附件目录(many) */
export async function createManyCatalogueAsync(
  mode: number,
  data: AttachCatalogueCreateDto[],
) {
  const response = await apiClient.post<
    AttachCatalogue[] | { error?: { message?: string } }
  >(`/api/app/attachment/createmany?mode=${mode}`, data);
  return response.data;
}

/**通过关联编号获取附件信息 */
export async function fetchAttachmentByReferenceAsync(
  data: {
    reference: string;
    referenceType: number;
  }[],
) {
  const response = await apiClient.post<
    AttachCatalogue[] | { error?: { message?: string } }
  >(`/api/app/attachment/findbyreference`, data);
  return response.data;
}
