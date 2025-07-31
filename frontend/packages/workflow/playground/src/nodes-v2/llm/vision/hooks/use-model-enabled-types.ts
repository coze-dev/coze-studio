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

import { useService } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/base';

import { WorkflowModelsService } from '@/services';

import { useModelType } from '../../hooks/use-model-type';

/**
 * Data types supported by the model
 */
export function useModelEnabledTypes() {
  const modelType = useModelType();
  const modelsService = useService(WorkflowModelsService);
  const modelAbility = modelsService.getModelAbility(modelType);
  const enabledTypes: ViewVariableType[] = [];

  if (modelAbility?.image_understanding) {
    enabledTypes.push(ViewVariableType.Image);
  }

  if (modelAbility?.video_understanding) {
    enabledTypes.push(ViewVariableType.Video);
  }

  return enabledTypes;
}
