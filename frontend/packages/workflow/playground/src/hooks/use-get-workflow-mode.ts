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

/**
 * This hooks are used to quickly determine the type of workflow
 */

import { useEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowMode } from '@coze-workflow/base/api';

import { WorkflowGlobalStateEntity } from '../typing';

export const useGetWorkflowMode = () => {
  const globalState = useEntity<WorkflowGlobalStateEntity>(
    WorkflowGlobalStateEntity,
  );

  const isImageFlow = globalState.flowMode === WorkflowMode.Imageflow;
  const isSceneFlow = globalState.flowMode === WorkflowMode.SceneFlow;
  const isChatflow = globalState.flowMode === WorkflowMode.ChatFlow;
  // const isSceneFlow = true;

  return {
    isImageFlow,
    isSceneFlow,
    isChatflow,
  };
};
