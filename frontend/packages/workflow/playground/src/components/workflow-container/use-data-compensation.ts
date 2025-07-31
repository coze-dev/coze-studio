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

import { useEffect } from 'react';

import {
  StandardNodeType,
  reporter,
  isUserInputStartParams,
} from '@coze-workflow/base';
import {
  LoggerEvent,
  LoggerService,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowSaveService } from '../../services/workflow-save-service';
import { type WorkflowGlobalStateEntity } from '../../entities';

/**
 * Whether the imported parameter BotUserInput of the start node has been compensated for (changed from required to non-required)
 * Changed the required settings in packages/workflow/nodes/src/workflow-nodes/start-node/index.ts
 * @param schemaJson
 * @returns
 */
export function isBotUserInputChanged(schemaJson: string | undefined): boolean {
  if (!schemaJson) {
    return false;
  }

  const schema = JSON.parse(schemaJson || '');
  const startNode = schema?.nodes?.find(v => v.type === StandardNodeType.Start);
  const startOutputs = startNode?.data?.outputs || [];
  const botUserInput = startOutputs.find(v => isUserInputStartParams(v.name));

  return Boolean(botUserInput?.required);
}

export function useDataCompensation(workflowState: WorkflowGlobalStateEntity) {
  const workflowSaveService =
    useService<WorkflowSaveService>(WorkflowSaveService);
  const loggerService = useService<LoggerService>(LoggerService);

  useEffect(() => {
    const disposable = loggerService.onLogger(({ event }) => {
      if (event === LoggerEvent.CANVAS_TTI) {
        // When reporting TTI, the node canvas layer is rendered

        const { inPluginUpdated } = workflowState || {};
        const isBotUserInputUpdated = isBotUserInputChanged(
          workflowState?.info?.schema_json,
        );

        const needDataCompensation = inPluginUpdated || isBotUserInputUpdated;
        if (needDataCompensation) {
          reporter.event({
            eventName: 'workflow_data_compensation_save',
          });

          // Data Compensation Save to Draft
          workflowSaveService.highPrioritySave();
        }
      }
    });

    return () => {
      disposable?.dispose();
    };
  }, []);
}
