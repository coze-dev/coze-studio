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

import { useShallow } from 'zustand/react/shallow';
import {
  useKnowledgeParams,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import { useKnowledgeNavigate } from '@coze-data/knowledge-common-hooks/use-case';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { type FormatType } from '@coze-arch/bot-api/knowledge';

import { getAddContentUrl } from '@/utils';
import { ActionType } from '@/types';

import { type ImportKnowledgeSourceButtonProps } from '../module';
import { ImportKnowledgeSourceButton } from '../base';

export type BizAgentIdeImportKnowledgeSourceButtonProps =
  ImportKnowledgeSourceButtonProps;

export const BizAgentIdeImportKnowledgeSourceButton = ({
  disabledTooltip,
}: BizAgentIdeImportKnowledgeSourceButtonProps) => {
  const navigate = useKnowledgeNavigate();
  const { documentList, dataSetDetail } = useKnowledgeStore(
    useShallow(state => ({
      documentList: state.documentList,
      dataSetDetail: state.dataSetDetail,
    })),
  );
  const params = useKnowledgeParams();
  const spaceId = useSpaceStore(item => item.space.id);
  return (
    <ImportKnowledgeSourceButton
      disabledTooltip={disabledTooltip}
      onSourceChange={unitType => {
        navigate(
          getAddContentUrl({
            spaceID: spaceId as string,
            datasetID: dataSetDetail?.dataset_id as string,
            docID: documentList?.[0]?.document_id,
            formatType: dataSetDetail?.format_type as FormatType,
            type: unitType as UnitType,
            pageMode: 'modal',
            botId: params.botID,
            actionType: ActionType.ADD,
          }),
        );
      }}
    />
  );
};
