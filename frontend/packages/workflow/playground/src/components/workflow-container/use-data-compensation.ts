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
import { LoggerEvent, LoggerService, useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowSaveService } from '../../services/workflow-save-service';
import { type WorkflowGlobalStateEntity } from '../../entities';

/**
 * 开始节点的入参 BotUserInput 是否进行了数据补偿（从必填改成了非必填）
 * 在 packages/workflow/nodes/src/workflow-nodes/start-node/index.ts 修改了必填设置
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
        // 上报 TTI 时，节点画布层渲染完毕

        const { inPluginUpdated } = workflowState || {};
        const isBotUserInputUpdated = isBotUserInputChanged(
          workflowState?.info?.schema_json,
        );

        const needDataCompensation = inPluginUpdated || isBotUserInputUpdated;
        if (needDataCompensation) {
          reporter.event({
            eventName: 'workflow_data_compensation_save',
          });

          // 数据补偿保存到草稿
          workflowSaveService.highPrioritySave();
        }
      }
    });

    return () => {
      disposable?.dispose();
    };
  }, []);
}
