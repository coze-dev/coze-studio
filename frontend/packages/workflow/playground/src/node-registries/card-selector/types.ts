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

import { type InputValueVO } from '@coze-workflow/base';

// 卡片项接口 - 使用简化的本地类型，从API响应转换而来
export interface CardItem {
  cardId: string;
  cardName: string;
  code: string;
  cardPicUrl?: string;
  picUrl?: string;
  cardShelfStatus?: string;
  cardShelfTime?: string;
  createUserId?: string;
  createUserName?: string;
  sassAppId?: string;
  sassWorkspaceId?: string;
  bizChannel?: string;
  cardClassId?: string;
}

export interface FormData {
  inputs: {
    inputParameters: InputValueVO[];
    filterSelector: string;
    selectedCard?: CardItem; // 新增：选中的卡片
    content: string;
    streamingOutput: boolean;
  };
}
