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

import { type Model } from '@coze-arch/bot-api/developer_api';

export const getModelOptionList = ({
  onlineModelList,
  offlineModelMap,
  currentModelId,
}: {
  onlineModelList: Model[];
  offlineModelMap: Record<string, Model>;
  currentModelId: string | undefined;
}) => {
  if (!currentModelId) {
    return onlineModelList;
  }
  const specialModel = offlineModelMap[currentModelId];
  if (!specialModel) {
    return onlineModelList;
  }
  return onlineModelList.concat([specialModel]);
};
