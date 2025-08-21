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

import { type FC, useRef } from 'react';

import {
  BaseLibraryPage,
  useDatabaseConfig,
  usePluginConfig,
  useWorkflowConfig,
  usePromptConfig,
  useKnowledgeConfig,
} from '@coze-studio/workspace-base/library';

export const LibraryPage: FC<{ spaceId: string; sourceType: string }> = ({
  spaceId,
  sourceType,
}) => {
  const basePageRef = useRef<{ reloadList: () => void }>(null);
  const configCommonParams = {
    spaceId,
    sourceType,
    reloadList: () => {
      basePageRef.current?.reloadList();
    },
  };
  const { config: pluginConfig, modals: pluginModals } =
    usePluginConfig(configCommonParams);
  const { config: workflowConfig, modals: workflowModals } =
    useWorkflowConfig(configCommonParams);
  const { config: knowledgeConfig, modals: knowledgeModals } =
    useKnowledgeConfig(configCommonParams);
  const { config: promptConfig, modals: promptModals } =
    usePromptConfig(configCommonParams);
  const { config: databaseConfig, modals: databaseModals } =
    useDatabaseConfig(configCommonParams);

  return (
    <>
      <BaseLibraryPage
        spaceId={spaceId}
        sourceType={sourceType}
        ref={basePageRef}
        entityConfigs={[
          pluginConfig,
          workflowConfig,
          knowledgeConfig,
          promptConfig,
          databaseConfig,
        ]}
      />
      {pluginModals}
      {workflowModals}
      {promptModals}
      {databaseModals}
      {knowledgeModals}
    </>
  );
};
