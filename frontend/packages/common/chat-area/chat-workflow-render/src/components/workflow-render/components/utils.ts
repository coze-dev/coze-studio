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

import { type IMessage } from '@coze-common/chat-uikit-shared';
import { safeJSONParse } from '@coze-common/chat-uikit';

import { type ChatflowNodeData } from './type';

export const extractChatflowMessage = (message: IMessage) => {
  if (message.content_type === 'card') {
    const contentStruct = safeJSONParse(message.content) as {
      x_properties: {
        workflow_card_info: string;
      };
    };
    const workflowDataStr = contentStruct?.x_properties?.workflow_card_info;
    if (workflowDataStr) {
      const cardData = safeJSONParse(workflowDataStr) as ChatflowNodeData;
      if (cardData?.card_type === 'QUESTION' && cardData?.question_card_data) {
        return cardData;
      }
      if (cardData?.card_type === 'INPUT' && cardData?.input_card_data) {
        return cardData;
      }
    }
  }
};
