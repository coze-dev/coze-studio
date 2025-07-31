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

import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { type DocumentInfo } from '@coze-arch/bot-api/knowledge';

import { useReloadKnowledgeIDE } from '@/hooks/use-case/use-reload-knowledge-ide';

import { type TableConfigMenuRegistry } from '../../knowledge-ide-table-config-menus';
import { KnowledgeConfigMenu as KnowledgeConfigMenuComponent } from '../../../components/knowledge-config-menu';

export interface TableConfigButtonProps {
  knowledgeTableConfigMenuContributes?: TableConfigMenuRegistry;
  onChangeDocList?: (docList: DocumentInfo[]) => void;
}

export const TableConfigButton = (props: TableConfigButtonProps) => {
  const { knowledgeTableConfigMenuContributes, onChangeDocList } = props;
  const documentList = useKnowledgeStore(state => state.documentList);
  const documentInfo = documentList?.[0];
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const { reload } = useReloadKnowledgeIDE();

  if (!knowledgeTableConfigMenuContributes) {
    return null;
  }

  return (
    <KnowledgeConfigMenuComponent>
      {canEdit
        ? knowledgeTableConfigMenuContributes
            ?.entries()
            .map(([key, { Component }]) => (
              <Component
                key={key}
                documentInfo={documentInfo}
                onChangeDocList={onChangeDocList}
                reload={reload}
              />
            ))
        : null}
    </KnowledgeConfigMenuComponent>
  );
};
