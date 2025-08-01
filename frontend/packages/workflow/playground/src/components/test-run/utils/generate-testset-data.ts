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

import { type TestsetData } from '@coze-devops/testset-manage';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';

import { FieldName } from '../constants';

const generateTestsetData = (testsetData?: TestsetData) => {
  const dataArray = safeJSONParse(testsetData?.caseBase?.input, []);
  let botData: string | undefined;
  /** TODO: Currently only one node is possible, and multiple nodes need to be expanded in the future */
  let nodeData: Record<string, unknown> | undefined;
  dataArray.forEach(data => {
    /** Special Virtual Node */
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
