import {
  fetchAttachmentByReferenceAsync,
  fetchMyWkInstance,
} from '@/api/workflow/instance';
import ApprovalDetail from '@/components/workflow/ApprovalDetail';
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
  const [processBasicInfo, setProcessBasicInfo] = useState<{
    processType: string;
    state: string;
  }>();
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
        });
        if (instance.currentExecutionPointer?.extensionAttributes?.form_data) {
          setFormSections(
            instance.currentExecutionPointer.extensionAttributes.form_data,
          );
          const attachs = await fetchAttachmentByReferenceAsync([
            { referenceType: 1, reference: instance.reference },
          ]);
          if (attachs as AttachCatalogue[]) {
            setAttachments(attachs as AttachCatalogue[]);
          }
        }
      }
    })();
  }, []);
  return (
    <>
      <ApprovalDetail
        processType={processBasicInfo?.processType}
        state={processBasicInfo?.state}
        sections={formSections}
      />
      <AttachmentViewer attachments={attachments} />
    </>
  );
}
