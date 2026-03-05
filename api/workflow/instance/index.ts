import apiClient from '@/api/client';
import { getUserProfileAsync } from '@/api/account';
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
  WkNodeTreeDto,
} from '@/types/workflow/instance/processInstance.types';

export const fetchMyWkInstances = async (
  params: Record<string, any> & PaginationParams,
): Promise<PagedResultDto<ProcessInstance>> => {
  const response = await apiClient.get<PagedResultDto<ProcessInstance>>(
    '/hxworkflow/workflow/mywkinstances',
    { params },
  );
  const raw = response?.data;
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const totalCount = typeof raw?.totalCount === 'number' ? raw.totalCount : 0;
  return { items, totalCount };
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

/**
 * 提交业务流程（后端 HxWorkflowController 使用 [FromBody] WkActivityInputDto，需传 PascalCase）。
 * 会在请求体 data 中自动注入当前用户信息（CurrentUserId、CurrentUserName），
 * 以便后端在 [AllowAnonymous] 或未解析 JWT 时仍能从 body 获取当前操作用户。
 */
export async function StartActivityAsync(data: WkActivityCreateDto) {
  let payload = data;
  try {
    const profile = await getUserProfileAsync();
    if (profile?.id != null) {
      payload = {
        ...data,
        data: {
          ...data.data,
          CurrentUserId: profile.id,
          CurrentUserName: profile.name ?? profile.id,
        },
      };
    }
  } catch (e) {
    console.warn('[StartActivityAsync] 获取当前用户信息失败，将不携带用户字段提交', e);
  }
  return await apiClient.post<null>('/hxworkflow/workflow/activity', payload);
}

/**获取流程模板详情 */
export async function getWkDefinitionDetailsAsync(paras: {
  id: string;
  version: number;
}) {
  return await apiClient.get<WorkflowDefinition>(`/hxworkflow/hxdefinition/details`, {
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

/** 获取流程实例节点（审批流程时间轴） */
export async function getInstanceNodesAsync(
  workflowId: string,
): Promise<WkNodeTreeDto[]> {
  const response = await apiClient.get<WkNodeTreeDto[]>(
    '/hxworkflow/workflow/workflowinstancenodes',
    { params: { workflowId } },
  );
  return response.data ?? [];
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
