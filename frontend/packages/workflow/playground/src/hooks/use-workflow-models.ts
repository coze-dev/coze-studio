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

import { useState, useEffect } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';
import { type MessageBizType } from '@coze-workflow/base';
import type { Model } from '@coze-arch/bot-api/developer_api';

import { bizTypeToDependencyTypeMap } from '@/services/workflow-dependency-service';
import { DependencySourceType } from '@/constants';

import { WorkflowModelsService } from '../services';
import { useDependencyService } from './use-dependency-service';

/**
 * Uniformly obtain the model data entry, monitor the change of model resources, and update the model data
 */
export const useWorkflowModels = () => {
  const modelsService = useService<WorkflowModelsService>(
    WorkflowModelsService,
  );
  const dependencyService = useDependencyService();
  const [models, setModels] = useState<Model[]>(
    modelsService?.getModels() ?? [],
  );

  useEffect(() => {
    const disposable = dependencyService.onDependencyChange(source => {
      if (
        bizTypeToDependencyTypeMap[source?.bizType as MessageBizType] ===
        DependencySourceType.LLM
      ) {
        const curModels = modelsService?.getModels() ?? [];
        setModels(curModels);
      }
    });

    return () => {
      disposable?.dispose?.();
    };
  }, []);

  return { models };
};
