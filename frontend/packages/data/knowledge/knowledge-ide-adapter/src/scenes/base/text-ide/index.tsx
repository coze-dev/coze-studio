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
  type TextKnowledgeWorkspaceProps,
  TextKnowledgeWorkspace,
} from '@coze-data/knowledge-ide-base/features/text-knowledge-workspace';
import { BaseKnowledgeIDENavBar } from '@coze-data/knowledge-ide-base/features/nav-bar/base';
import {
  KnowledgeIDERegistryContext,
  type KnowledgeIDERegistry,
} from '@coze-data/knowledge-ide-base/context/knowledge-ide-registry-context';

import { type BaseKnowledgeIDEProps } from '../types';
import { importKnowledgeSourceMenuContributes } from './import-knowledge-source-menu-contributes';

export interface BaseKnowledgeTextIDEProps extends BaseKnowledgeIDEProps {
  contentProps?: Partial<TextKnowledgeWorkspaceProps>;
}

const registryContextValue: KnowledgeIDERegistry = {
  importKnowledgeMenuSourceFeatureRegistry:
    importKnowledgeSourceMenuContributes,
};

export const BaseKnowledgeTextIDE = (props: BaseKnowledgeTextIDEProps) => (
  <KnowledgeIDERegistryContext.Provider value={registryContextValue}>
    <KnowledgeIDEBaseLayout
      renderNavBar={({ statusInfo }) => (
        <BaseKnowledgeIDENavBar
          progressMap={statusInfo.progressMap}
          {...props.navBarProps}
        />
      )}
      renderContent={({ dataActions, statusInfo }) => (
        <TextKnowledgeWorkspace
          progressMap={statusInfo.progressMap}
          reload={dataActions.refreshData}
          onChangeDocList={dataActions.updateDocumentList}
          linkOriginUrlButton={props.contentProps?.linkOriginUrlButton}
          fetchSliceButton={props.contentProps?.fetchSliceButton}
        />
      )}
      {...props.layoutProps}
    />
  </KnowledgeIDERegistryContext.Provider>
);
