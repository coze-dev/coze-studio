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
