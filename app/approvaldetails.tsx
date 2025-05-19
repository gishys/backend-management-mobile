import {
  createManyCatalogueAsync,
  fetchAttachmentByReferenceAsync,
  fetchMyWkInstance,
  InitMaterialsAsync,
} from '@/api/workflow/instance';
import ApprovalDetail, {
  ProcessInstanceInfo,
} from '@/components/workflow/ApprovalDetail';
import AttachmentViewer from '@/components/workflow/AttachmentViewer';
import { FormSection } from '@/types/workflow/form/form.types';
import {
  AttachCatalogue,
  WorkflowInstance,
} from '@/types/workflow/instance/processInstance.types';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

export default function approvaldetails() {
  const params = useLocalSearchParams();
  const [formSections, setFormSections] = useState<FormSection[]>([]);
  const [attachments, setAttachments] = useState<AttachCatalogue[]>([]);
  const [processBasicInfo, setProcessBasicInfo] =
    useState<ProcessInstanceInfo>();
  useEffect(() => {
    (async () => {
      console.log(params);
      if (!params.wkInstanceId) return;
      const wkInstance = await fetchMyWkInstance({
        workflowId: params.wkInstanceId.toString(),
      });
      if (wkInstance as WorkflowInstance) {
        const instance = wkInstance as WorkflowInstance;
        setProcessBasicInfo({
          processType: instance.processType,
          state: 'Runnable',
          reference: instance.reference,
          wkInstanceKey: instance.id,
          definitionId: instance.definitionId,
          currentPointerId: instance.currentExecutionPointer.id,
          currentStepName: instance.currentExecutionPointer.stepName,
          form_data:
            instance.currentExecutionPointer.extensionAttributes?.form_data,
        });
        const attachs = await fetchAttachmentByReferenceAsync([
          { referenceType: 1, reference: instance.reference },
        ]);
        if (attachs as AttachCatalogue[]) {
          setAttachments(attachs as AttachCatalogue[]);
        }
        if (instance.currentExecutionPointer?.extensionAttributes?.form_data) {
          setFormSections(
            instance.currentExecutionPointer.extensionAttributes.form_data,
          );
        }
        if (!instance.currentExecutionPointer.isInitMaterials) {
          await createManyCatalogueAsync(
            5,
            instance.currentExecutionPointer.materials,
          );
          await InitMaterialsAsync({
            executionPointerId: instance.currentExecutionPointer.id,
          });
        }
      }
    })();
  }, []);
  return (
    <>
      <ApprovalDetail
        procesInstanceInfo={processBasicInfo}
        sections={formSections}
      />
      <AttachmentViewer attachments={attachments} />
    </>
  );
}
