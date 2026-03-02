import {
  createManyCatalogueAsync,
  fetchAttachmentByReferenceAsync,
  fetchMyWkInstance,
  InitMaterialsAsync,
} from '@/api/workflow/instance';
import ApprovalDetail, {
  ProcessInstanceInfo,
} from '@/components/workflow/ApprovalDetail';
import { FormSection } from '@/types/workflow/form/form.types';
import {
  AttachCatalogue,
  WorkflowInstance,
} from '@/types/workflow/instance/processInstance.types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

export default function approvaldetails() {
  const params = useLocalSearchParams();
  const toast = useToast();
  const [formSections, setFormSections] = useState<FormSection[]>([]);
  const [attachments, setAttachments] = useState<AttachCatalogue[]>([]);
  const [processBasicInfo, setProcessBasicInfo] =
    useState<ProcessInstanceInfo>();

  // 异步初始化材料 - 不阻塞页面渲染
  const initMaterialsAsync = useCallback(
    async (instance: WorkflowInstance) => {
      try {
        // 检查是否需要初始化材料
        if (instance.currentExecutionPointer.isInitMaterials) {
          return; // 已经初始化过，直接返回
        }

        // 检查是否有材料需要创建
        if (
          !instance.currentExecutionPointer.materials ||
          instance.currentExecutionPointer.materials.length === 0
        ) {
          return; // 没有材料需要创建
        }

        // 异步创建材料目录，不阻塞页面渲染
        await createManyCatalogueAsync(
          5,
          instance.currentExecutionPointer.materials,
        );

        // 标记材料已初始化
        await InitMaterialsAsync({
          executionPointerId: instance.currentExecutionPointer.id,
        });

        // 静默执行，不显示成功提示（避免干扰用户）
        console.log('材料初始化成功');
      } catch (error: any) {
        // 错误处理：记录日志但不阻塞页面
        console.error('初始化材料失败:', error);
        
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          '材料初始化失败，但不影响页面使用';

        // 显示错误提示，但不阻塞用户操作
        toast.show({
          placement: 'top',
          duration: 4000,
          render: ({ id }) => {
            return (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <ToastTitle>材料初始化失败</ToastTitle>
                <ToastDescription>{errorMessage}</ToastDescription>
              </Toast>
            );
          },
        });
      }
    },
    [toast],
  );

  useEffect(() => {
    (async () => {
      console.log(params);
      if (!params.wkInstanceId) return;

      try {
        // 获取工作流实例
        const wkInstance = await fetchMyWkInstance({
          workflowId: params.wkInstanceId.toString(),
        });

        if (wkInstance as WorkflowInstance) {
          const instance = wkInstance as WorkflowInstance;

          // 立即设置页面数据，不等待材料初始化
          setProcessBasicInfo({
            processType: instance.processType,
            state: 'Runnable',
            reference: instance.reference,
            wkInstanceKey: instance.id,
            definitionId: instance.definitionId,
            version: instance.version,
            currentPointerId: instance.currentExecutionPointer.id,
            currentStepName: instance.currentExecutionPointer.stepName,
            form_data:
              instance.currentExecutionPointer.extensionAttributes?.form_data,
          });

          // 获取附件信息
          const attachs = await fetchAttachmentByReferenceAsync([
            { referenceType: 1, reference: instance.reference },
          ]);
          if (attachs as AttachCatalogue[]) {
            setAttachments(attachs as AttachCatalogue[]);
          }

          // 设置表单数据
          if (instance.currentExecutionPointer?.extensionAttributes?.form_data) {
            setFormSections(
              instance.currentExecutionPointer.extensionAttributes.form_data,
            );
          }

          // 异步初始化材料，不阻塞页面渲染
          // 使用 setTimeout 确保页面先渲染，然后在下一个事件循环中执行
          initMaterialsAsync(instance).catch((error) => {
            // 额外的错误捕获，确保不会影响页面
            console.error('材料初始化异常:', error);
          });
        }
      } catch (error: any) {
        console.error('加载审批详情失败:', error);
        
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          error?.message ||
          '加载审批详情失败，请稍后重试';

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
      }
    })();
  }, [params.wkInstanceId, initMaterialsAsync, toast]);

  return (
    <ApprovalDetail
      procesInstanceInfo={processBasicInfo}
      sections={formSections}
      attachments={attachments}
    />
  );
}
