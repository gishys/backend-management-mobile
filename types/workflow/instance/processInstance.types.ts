export type ProcessInstance = {
    id: string;
    reference: string;
    processingStepName: string;
    recipient: string;
    submitter: string;
    receivingTime: string;
    stepCommitmentDeadline: string;
    state: string;
    businessType: string;
    processType: string;
    isSign: boolean;
    isProcessed: boolean;
    data: Record<string, any>;
  };