/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  // A modal for creating a knowledge base
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
  // A modal for creating a knowledge base
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
