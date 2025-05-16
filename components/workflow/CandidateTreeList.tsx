import { getWkInstancePointerCandidateAsync } from '@/api/workflow/instance';
import React, { useEffect, useState } from 'react';
import TreeList, { TreeNode } from './TreeList';

const CondidateTreeList: React.FC<{
  wkInstanceKey: string;
  onSlectKeys: (keys: string[]) => void;
}> = ({ wkInstanceKey, onSlectKeys }) => {
  const [allNodes, setAllNodes] = useState<TreeNode[]>([]); // 你的初始数据
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
  return <TreeList nodes={allNodes} onSlectKeys={onSlectKeys} />;
};

export default CondidateTreeList;
