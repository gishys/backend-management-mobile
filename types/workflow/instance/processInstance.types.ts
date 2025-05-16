import { FormSection } from '../form/form.types';

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

export type WorkflowInstance = {
  id: string;
  definitionId: string;
  reference: string;
  registrationCategory: string;
  receiver: string;
  receiveTime: string;
  businessCommitmentDeadline: string;
  processName: string;
  located: string;
  canHandle: boolean;
  businessType: string;
  processType: string;
  currentExecutionPointer: CurrentExecutionPointer;
  errors?: ExecutionError[];
  wkAuditors?: WkAuditorDto[];
  data: Record<string, any>;
};

export type CurrentExecutionPointer = {
  id: string;
  stepName: string;
  stepDisplayName: string;
  status: ExecutionPointerStatus;
  stepId: number;
  active: boolean;
  startTime: string;
  endTime?: string;
  recipient: string;
  recipientId: string;
  submitter?: string;
  submitterId?: string;
  isInitMaterials?: boolean;
  forms: ApplicationFormDto[];
  printForms: ApplicationFormDto[];
  errors: string;
  params: WkParam[];
  currentCandidateInfo: WkPointerCandidateDto;
  nextPointers: WkNodeDetails[];
  materials: AttachCatalogueCreateDto[];
  extensionAttributes?: Record<string, any> & { form_data?: FormSection[] };
};

export type ExecutionError = {
  errorTime: string;
  message: string;
};

/**
 * @param {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 20} 1:队列中；2:运行中；3:已完成；5:办理中；6:发生错误；20:未办理；
 */
export type ExecutionPointerStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 20;

export type WkAuditorDto = {
  id: string;
  workflowId: string;
  executionPointerId: string;
  status: 0 | 1 | 2;
  auditTime?: string;
  remark?: string;
  userId: string;
  userName: string;
};

export type ApplicationFormDto = {
  title: string;
  params: WkParam[];
  id: string;
  data?: string;
  applicationComponentType: ApplicationComponentType;
  extraProperties?: Record<string, any>;
  name: string;
  applicationType: ApplicationType;
};

export type WkParam = {
  wkParamKey: string;
  name: string;
  displayName: string;
  value: string;
};

/**
 * @param {1|2} 1：表单；2：打印表单；
 */
export type ApplicationType = 1 | 2;

/**
 * @param {1|2|3} 1：路由组件；2：源码组件；3：Url组件；
 */
export type ApplicationComponentType = 1 | 2 | 3;

/**
 * @param {1 | 2 | 3 | 4 | 5} exeOperateType 人员类型（主办、抄送、会签、委托、通知）
 * @param {1 | 2 | 3 | 4 | 5 | 6 | 7} parentState 人员类型（被回退、待接收、待完成、已终止、已挂起、已完成、等待中）
 * @param {1 | 2 | 3} executorType 参与者类型（角色、职员、岗位）
 */
export type WkPointerCandidateDto = {
  candidateId: string;
  userName: string;
  displayUserName: string;
  defaultSelection: boolean;
  exeOperateType: 1 | 2 | 3 | 4 | 5;
  parentState: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  follow?: boolean;
  executorType: 1 | 2 | 3;
};

/**
 * @param {boolean} selectable 节点是否可选择
 * @param {string} label 节点描述
 * @param {string} nextNodeName 节点名称
 * @param {WkNodeType} nodeType 节点类型
 * @param {boolean} previousStep 是否上一节点
 */
export type WkNodeDetails = {
  selectable: boolean;
  label: string;
  nextNodeName: string;
  nodeType: WkNodeType;
  previousStep: boolean;
};

/**
 * @param {1|2} 1:向前；2：后退；
 */
export type WkNodeType = 1 | 2;

/**
 * @param { 1 | 2 | 3 | 5 | 6 | 7 | 8 | 9}
 * 1:流程附件，reference为受理编号；
 * 2:不动产单元附件，reference为不动产单元号；
 * 3:组织附件，reference为组织Id；
 * 5:用户附件，reference为用户Id；
 * 6:纠纷附件，reference为不动产单元号;
 * 7:智能比对，reference为受理编号;
 * 8:档案附件，reference为受理编号;
 */
export type AttachCatalogueCreateDto = {
  id?: string;
  reference?: string;
  referenceType: CatalogueReferenceType;
  attachReceiveType: number;
  catalogueName: string;
  isRequired: boolean;
  isStatic?: boolean;
  parentId?: string;
  isVerification?: boolean;
  verificationPassed?: boolean;
  children?: AttachCatalogueCreateDto[];
};

/**
 * @param { 1 | 2 | 3 | 5 | 6 | 7 | 8 | 9}
 * 1:流程附件，reference为受理编号；
 * 2:不动产单元附件，reference为不动产单元号；
 * 3:组织附件，reference为组织Id；
 * 5:用户附件，reference为用户Id；
 * 6:纠纷附件，reference为不动产单元号;
 * 7:智能比对，reference为受理编号;
 * 8:档案附件，reference为受理编号;
 */
export type CatalogueReferenceType = 1 | 2 | 3 | 5 | 6 | 7 | 8 | 9;

export type AttachCatalogue = {
  id: string;
  reference: string;
  referenceType: CatalogueReferenceType;
  attachReceiveType: number;
  catalogueName: string;
  attachCount?: number;
  pageCount?: number;
  isRequired?: boolean;
  sequenceNumber: number;
  isStatic: boolean;
  creationTime: string;
  creatorId: string;
  children?: AttachCatalogue[];
  attachFiles?: AttachFile[];
};

export type AttachFile = {
  id: string;
  fileName: string;
  fileAlias: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  downloadTimes: number;
  sequenceNumber: number;
};

export type CatalogueVerifyDetailedInfo = {
  isRequired: boolean;
  reference: string;
  name: string;
  uploaded: boolean;
  children?: CatalogueVerifyDetailedInfo[];
};
export type CatalogueVerifyProfileInfo = {
  reference: string;
  message: string[];
};
export type CatalogueVerifyResultDto = {
  detailedInfo: CatalogueVerifyDetailedInfo[];
  profileInfo: CatalogueVerifyProfileInfo[];
};

export type WkCandidateDto = {
  candidateId: string;
  userName: string;
  displayUserName: string;
  defaultSelection: boolean;
};

export type WkActivityCreateDto = {
  activityName: string;
  workflowId: string;
  data: WkActivityDataDto;
};
export type WkActivityDataDto = {
  DecideBranching: string;
  Remark: string;
  Candidates: string;
  ExecutionType: WkNodeType;
};

export type WkConditionNode = {
  nextNodeName: string;
  nodeType: WkNodeType;
};

export type WorkflowDefinition = {
  id: string;
  version: number;
  title: string;
  limitTime?: number;
  isEnabled: boolean;
  description: string;
  sortNumber: number;
  groupId?: string;
  businessType: string;
  processType: string;
  nodes: WorkflowNode[];
  extraProperties?:
    | { graph_nodes: any[]; graph_edges: any[]; graph_data: any }
    | Record<string, any>;
};

/**
 *@param {1 | 2 | 3} 1.开始;2.活动步骤节点;3.结束;
 */
export type StepNodeType = 1 | 2 | 3;
export type WorkflowNode = {
  id: string;
  name: string;
  displayName: string;
  limitTime?: number;
  wkStepBodyId: string;
  stepNodeType: StepNodeType;
  version: number;
  nextNodes: WkConditionNode[];
  wkCandidates: WkCandidateCreateDto[];
  applicationForms: NodeAddApplicationFormDto[];
  params: WkParam[];
};

export type WkCandidateCreateDto = {
  candidateId: string;
  userName: string;
  displayUserName: string;
  defaultSelection: boolean;
  executorType: 1 | 2 | 3;
};

export type NodeAddApplicationFormDto = {
  applicationFormId: string;
  sequenceNumber: number;
  title?: string;
  applicationType: ApplicationType;
  params: WkParam[];
};
