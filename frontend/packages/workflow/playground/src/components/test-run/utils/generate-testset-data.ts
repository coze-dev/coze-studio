import { type TestsetData } from '@coze-devops/testset-manage';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';

import { FieldName } from '../constants';

const generateTestsetData = (testsetData?: TestsetData) => {
  const dataArray = safeJSONParse(testsetData?.caseBase?.input, []);
  let botData: string | undefined;
  /** TODO: 目前 node 只可能有一个，未来有多个需要视情况扩展 @jiangxujin */
  let nodeData: Record<string, unknown> | undefined;
  dataArray.forEach(data => {
    /** 特殊虚拟节点 */
    if (data?.component_type === ComponentType.CozeVariableBot) {
      botData = data.inputs?.[0]?.value;
    } else {
      nodeData = data.inputs?.reduce(
        (prev, current) => ({
          ...prev,
          [current.name]: current.value,
        }),
        nodeData,
      );
    }
  });
  const value = {};
  if (nodeData) {
    value[FieldName.Node] = {
      [FieldName.Input]: nodeData,
    };
  }
  if (botData) {
    value[FieldName.Bot] = botData;
  }

  return value;
};

export { generateTestsetData };
