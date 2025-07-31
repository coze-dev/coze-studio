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
import { useKnowledgeStore } from '@coze-data/knowledge-stores';

import { NavBarActionButton } from '@/features/nav-bar-action-button';
import { BizAgentIdeImportKnowledgeSourceButton } from '@/features/import-knowledge-source-button/biz-agent-ide';
import { KnowledgeModalNavBar as KnowledgeModalNavBarComponent } from '@/components/knowledge-modal-nav-bar';

import { type KnowledgeIDENavBarProps } from '../module';
import { useBeforeKnowledgeIDEClose } from './hooks/use-case/use-before-knowledgeide-close';

export type BizAgentIdeKnowledgeIDENavBarProps = KnowledgeIDENavBarProps;

export const BizAgentIdeKnowledgeIDENavBar = (
  props: BizAgentIdeKnowledgeIDENavBarProps,
) => {
  const { onBack, importKnowledgeSourceButton } = props;
  const { dataSetDetail, documentList } = useKnowledgeStore(
    useShallow(state => ({
      dataSetDetail: state.dataSetDetail,
      documentList: state.documentList,
    })),
  );
  const handleBotIdeBack = useBeforeKnowledgeIDEClose({
    onBack,
  });
  return (
    <KnowledgeModalNavBarComponent
      title={dataSetDetail?.name as string}
      onBack={onBack}
      datasetDetail={dataSetDetail}
      docInfo={documentList?.[0]}
      actionButtons={
        <NavBarActionButton
          key={dataSetDetail?.dataset_id}
          dataSetDetail={dataSetDetail}
        />
      }
      importKnowledgeSourceButton={
        importKnowledgeSourceButton ?? (
          <BizAgentIdeImportKnowledgeSourceButton />
        )
      }
      beforeBack={handleBotIdeBack}
    />
  );
};
