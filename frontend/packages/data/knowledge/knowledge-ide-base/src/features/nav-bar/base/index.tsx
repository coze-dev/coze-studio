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

import { ImportKnowledgeSourceButton } from '@/features/import-knowledge-source-button/base';
import { KnowledgeIDENavBar as KnowledgeIDENavBarComponent } from '@/components/knowledge-nav-bar';

import { type KnowledgeIDENavBarProps } from '../module';

export const BaseKnowledgeIDENavBar = (props: KnowledgeIDENavBarProps) => {
  const { progressMap, hideBackButton, importKnowledgeSourceButton } = props;
  const { setDataSetDetail } = useKnowledgeStore(
    useShallow(state => ({
      setDataSetDetail: state.setDataSetDetail,
    })),
  );
  return (
    <KnowledgeIDENavBarComponent
      {...props}
      importKnowledgeSourceButton={
        importKnowledgeSourceButton ?? <ImportKnowledgeSourceButton />
      }
      onChangeDataset={setDataSetDetail}
      progressMap={progressMap}
      hideBackButton={hideBackButton}
    />
  );
};
