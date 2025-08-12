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

import { type RecallStrategy } from '@coze-arch/bot-api/playground_api';

import { type IDataSetInfo } from './type';

export const recallStrategyUpdater: (params: {
  datasetInfo: IDataSetInfo;
  field: keyof RecallStrategy;
  value: boolean;
}) => IDataSetInfo = ({ datasetInfo, field, value }) => {
  if (!datasetInfo.recall_strategy) {
    datasetInfo.recall_strategy = {
      [field]: value,
    };
  } else {
    datasetInfo.recall_strategy[field] = value;
  }
  return datasetInfo;
};
