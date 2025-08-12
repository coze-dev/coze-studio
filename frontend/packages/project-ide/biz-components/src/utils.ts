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

import { ResType } from '@coze-arch/bot-api/plugin_develop';

import { BizResourceTypeEnum } from '@/resource-folder-coze/type';

export const resTypeDTOToVO = (
  resType?: ResType,
): BizResourceTypeEnum | undefined => {
  if (!resType) {
    return;
  }
  switch (resType) {
    case ResType.Imageflow:
    case ResType.Workflow:
      return BizResourceTypeEnum.Workflow;
    case ResType.Knowledge:
      return BizResourceTypeEnum.Knowledge;
    case ResType.Plugin:
      return BizResourceTypeEnum.Plugin;
    case ResType.Variable:
      return BizResourceTypeEnum.Variable;
    case ResType.Database:
      return BizResourceTypeEnum.Database;
    default:
      return BizResourceTypeEnum.Workflow;
  }
};
