import {
  ComponentType,
  type CaseDataDetail,
} from '@coze-arch/bot-api/debugger_api';

import { typeSafeJSONParse } from '../safe-json-parse';
import { FieldName } from '../../constants';

const getTestDataByTestset = (testsetData?: CaseDataDetail) => {
  const dataArray = (typeSafeJSONParse(testsetData?.caseBase?.input) ||
    []) as any[];
  let botData: string | undefined;
  let chatData: string | undefined;
  let nodeData: Record<string, unknown> | undefined;

  dataArray.forEach(data => {
    /** 特殊虚拟节点 */
    if (data?.component_type === ComponentType.CozeVariableBot) {
      botData = data.inputs?.[0]?.value;
    } else if (data?.component_type === ComponentType.CozeVariableChat) {
      chatData = data.inputs?.[0]?.value;
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
  if (chatData) {
    value[FieldName.Chat] = chatData;
  }

  return value;
};

export { getTestDataByTestset };
