import { useEffect, useState } from 'react';

import { KnowledgeApi } from '@coze-arch/bot-api';

interface ModelInfo {
  name?: string;
}

export const useVectorModelList = () => {
  const [vectorModellList, setVectorModelList] = useState<ModelInfo[]>([]);

  useEffect(() => {
    async function getVectorModelList() {
      const res = await KnowledgeApi.ListModel();
      setVectorModelList(res?.models ?? []);
    }

    getVectorModelList();
  }, []);

  return { vectorModellList };
};
