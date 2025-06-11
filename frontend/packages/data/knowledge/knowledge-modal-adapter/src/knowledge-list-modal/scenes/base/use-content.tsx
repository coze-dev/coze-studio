import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import {
  useKnowledgeListModalContent as useKnowledgeListModalContentBase,
  type DataSetModalContentProps,
  KnowledgeListModalContent as KnowledgeListModalContentBase,
} from '@coze-data/knowledge-modal-base';

import { useCreateKnowledgeModalV2 } from '../../../create-knowledge-modal-v2/scenes/base';
export const useKnowledgeListModalContent = (
  props: DataSetModalContentProps,
) => {
  const { projectID, onClickAddKnowledge, beforeCreate } = props;
  // 创建知识库的modal
  const createKnowledgeModal = useCreateKnowledgeModalV2({
    projectID,
    onFinish: (datasetId: string, type: UnitType, shouldUpload: boolean) => {
      onClickAddKnowledge?.(datasetId, type, shouldUpload);
      createKnowledgeModal.close();
    },
    beforeCreate,
  });
  return useKnowledgeListModalContentBase({
    ...props,
    createKnowledgeModal,
  });
};

export const KnowledgeListModalContent = (props: DataSetModalContentProps) => {
  const { projectID, onClickAddKnowledge, beforeCreate } = props;
  // 创建知识库的modal
  const createKnowledgeModal = useCreateKnowledgeModalV2({
    projectID,
    onFinish: (datasetId: string, type: UnitType, shouldUpload: boolean) => {
      onClickAddKnowledge?.(datasetId, type, shouldUpload);
      createKnowledgeModal.close();
    },
    beforeCreate,
  });
  return (
    <KnowledgeListModalContentBase
      {...props}
      createKnowledgeModal={createKnowledgeModal}
    />
  );
};
