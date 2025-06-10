import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import {
  useKnowledgeListModal as useKnowledgeListModalBase,
  type UseKnowledgeListModalParams,
} from '@coze-data/knowledge-modal-base';

import { useCreateKnowledgeModalV2 } from '../../../create-knowledge-modal-v2/scenes/base';

// 直接使用原始参数类型，不需要创建新的接口
export const useKnowledgeListModal = (
  params: Omit<UseKnowledgeListModalParams, 'createKnowledgeModal'>,
) => {
  const { onClickAddKnowledge, beforeCreate, projectID } = params;

  // 创建知识库的modal
  const createKnowledgeModal = useCreateKnowledgeModalV2({
    projectID,
    onFinish: (datasetId: string, type: UnitType, shouldUpload: boolean) => {
      onClickAddKnowledge?.(datasetId, type, shouldUpload);
      createKnowledgeModal.close();
    },
    beforeCreate,
  });

  // 将createKnowledgeModal传递给base组件
  return useKnowledgeListModalBase({
    ...params,
    createKnowledgeModal,
  });
};
