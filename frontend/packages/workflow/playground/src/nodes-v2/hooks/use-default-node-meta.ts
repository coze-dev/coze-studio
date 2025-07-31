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

import { useMemo } from 'react';

import {
  useEntityFromContext,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { type StandardNodeType } from '@coze-workflow/base';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
export function useDefaultNodeMeta() {
  const node = useEntityFromContext() as FlowNodeEntity;
  const playgroundContext = node.getService<WorkflowPlaygroundContext>(
    WorkflowPlaygroundContext,
  );

  return useMemo(() => {
    const meta = playgroundContext.getNodeTemplateInfoByType(
      node.flowNodeType as StandardNodeType,
    );
    const { nodesService } = playgroundContext as WorkflowPlaygroundContext;

    if (!meta) {
      return undefined;
    }

    return {
      ...meta,
      title: nodesService.createUniqTitle(meta.title, node),
    };
  }, []);
}
