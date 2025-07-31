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

import { isObject } from 'lodash-es';
import { SettingOnErrorProcessType } from '@coze-workflow/nodes';
import { NodeExeStatus, useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

import { useExecStateEntity } from '../../../hooks';

const hasError = (output?: string) => {
  if (!output) {
    return false;
  }

  const outputJSON = typeSafeJSONParse(output) as {
    isSuccess?: boolean;
    errorBody?: {
      errorCode?: string;
    };
  };
  return (
    outputJSON &&
    isObject(outputJSON) &&
    outputJSON.isSuccess === false &&
    outputJSON.errorBody?.errorCode
  );
};

export const useSettingOnErrorDesc = (nodeId: string) => {
  const execEntity = useExecStateEntity();

  const executeResult = execEntity.getNodeExecResult(nodeId);
  const { nodeStatus, output } = executeResult || {};
  const settingOnError = useWorkflowNode().data?.settingOnError;

  if (
    !settingOnError?.settingOnErrorIsOpen ||
    nodeStatus !== NodeExeStatus.Success ||
    !hasError(output)
  ) {
    return;
  }

  const processType =
    settingOnError?.processType || SettingOnErrorProcessType.RETURN;

  return processType === SettingOnErrorProcessType.EXCEPTION
    ? I18n.t('workflow_250421_01', undefined, '异常，执行异常流程')
    : I18n.t('workflow_250421_02', undefined, '异常，返回设定内容');
};
