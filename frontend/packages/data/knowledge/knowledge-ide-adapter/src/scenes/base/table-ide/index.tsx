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

import { KnowledgeIDEBaseLayout } from '@coze-data/knowledge-ide-base/layout/base';
import {
  TableKnowledgeWorkspace,
  type TableKnowledgeWorkspaceProps,
} from '@coze-data/knowledge-ide-base/features/table-knowledge-workspace';
import { BaseKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/base';
import { KnowledgeIDETableConfig } from '@coze-data/knowledge-ide-base/features/knowledge-ide-table-config';
import {
  KnowledgeIDERegistryContext,
  type KnowledgeIDERegistry,
} from '@coze-data/knowledge-ide-base/context/knowledge-ide-registry-context';

import { type BaseKnowledgeIDEProps } from '../types';
import { importKnowledgeSourceMenuContributes } from './import-knowledge-source-menu-contributes';

export interface BaseKnowledgeTableIDEProps extends BaseKnowledgeIDEProps {
  contentProps?: Partial<TableKnowledgeWorkspaceProps>;
}

const registryContextValue: KnowledgeIDERegistry = {
  importKnowledgeMenuSourceFeatureRegistry:
    importKnowledgeSourceMenuContributes,
};

export const BaseKnowledgeTableIDE = (props: BaseKnowledgeTableIDEProps) => (
  <KnowledgeIDERegistryContext.Provider value={registryContextValue}>
    <KnowledgeIDEBaseLayout
      renderNavBar={({ statusInfo, dataActions }) => (
        <BaseKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          tableConfigButton={
            <KnowledgeIDETableConfig
              onChangeDocList={dataActions.updateDocumentList}
            />
          }
          {...props.navBarProps}
        />
      )}
      renderContent={({ dataActions, statusInfo }) => (
        <TableKnowledgeWorkspace
          reload={dataActions.refreshData}
          onChangeDocList={dataActions.updateDocumentList}
          isReloading={statusInfo.isReloading}
          {...props.contentProps}
        />
      )}
      {...props.layoutProps}
    />
  </KnowledgeIDERegistryContext.Provider>
);
