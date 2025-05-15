export const getProcessInstanceStateTitle = (value?: string) => {
  const states: Record<string, string> = {
    Runnable: '运行中',
    Suspended: '挂起',
    Complete: '完成',
    Terminated: '终止',
  };
  if (!value) return undefined;
  return states[value];
};
