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
    /** Special Virtual Node */
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
