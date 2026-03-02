import { getWkInstancePointerCandidateAsync } from '@/api/workflow/instance';
import React, { forwardRef, useEffect, useState } from 'react';
import TreeList, { TreeNode, TreeListRef } from './TreeList';

const CondidateTreeList = forwardRef<
  TreeListRef,
  {
    wkInstanceKey: string;
    onSlectKeys: (keys: string[]) => void;
    ListHeaderComponent?: React.ReactElement | null;
  }
>(function CondidateTreeList({ wkInstanceKey, onSlectKeys, ListHeaderComponent }, ref) {
  const [allNodes, setAllNodes] = useState<TreeNode[]>([]);
  useEffect(() => {
    const init = async () => {
      if (!wkInstanceKey) return;
      const { data } = await getWkInstancePointerCandidateAsync({
        workflowId: wkInstanceKey,
      });
      setAllNodes([
        {
          id: 'org',
          name: '可选择用户',
          type: 'organization',
          children: data.map((candidate) => ({
            id: candidate.candidateId,
            name: candidate.displayUserName,
            type: 'person',
          })),
        },
      ]);
    };
    init();
  }, [wkInstanceKey]);
  return (
    <TreeList
      ref={ref}
      nodes={allNodes}
      onSlectKeys={onSlectKeys}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
});

export default CondidateTreeList;
