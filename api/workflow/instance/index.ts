import apiClient from '@/api/client';
import { PagedResultDto, PaginationParams } from '@/types/page.types';
import {
  AttachCatalogue,
  AttachCatalogueCreateDto,
  CatalogueVerifyResultDto,
  ProcessInstance,
  WorkflowInstance,
  WkCandidateDto,
  WkActivityCreateDto,
  WorkflowDefinition,
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

/**验证必填文件夹已上传文件 */
export async function verifyCataloguesAsync(
  data: {
    reference: string;
    referenceType: number;
  }[],
  params: { details: boolean },
) {
  const response = await apiClient.post<CatalogueVerifyResultDto>(
    `/api/app/attachment/verifycatalogues`,
    data,
    { params: params },
  );
  return response.data;
}

/**获取可办理人 */
export async function getWkInstancePointerCandidateAsync(paras: {
  workflowId: string;
}) {
  return await apiClient.get<WkCandidateDto[]>(
    `/hxworkflow/workflow/candidate/${paras.workflowId}`,
  );
}

/**提交业务流程 */
export async function StartActivityAsync(data: WkActivityCreateDto) {
  return await apiClient.post<null>('/hxworkflow/workflow/activity', data);
}

/**获取流程模板详情 */
export async function getWkDefinitionDetailsAsync(paras: {
  id: string;
  version: number;
}) {
  return await apiClient.get<WorkflowDefinition>(`/hxdefinition/details`, {
    params: paras,
  });
}

/**更新是否创建材料 */
export async function InitMaterialsAsync(data: { executionPointerId: string }) {
  return await apiClient.put<null, { error?: { message?: string } }>(
    '/hxworkflow/workflow/mywkinstance/materials',
    data,
  );
}

/**更新节点扩展字段 */
export async function updateExecutionPointerAsync(
  params: { executionPointerId: string },
  data: Record<string, any>,
) {
  return await apiClient.put<null, { error?: { message?: string } }>(
    `/hxworkflow/workflow/data`,
    data,
    { params: params },
  );
}
