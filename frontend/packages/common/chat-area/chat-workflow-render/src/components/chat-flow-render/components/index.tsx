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

import { memo, useMemo } from 'react';

import { isEqual, isFunction, omitBy } from 'lodash-es';

import { extractChatflowMessage } from './utils';
import { type ChatflowNodeData, type RenderNodeEntryProps } from './type';
import { QuestionNodeRender } from './question-node-render';
import { InputNodeRender } from './input-node-render';

const BaseComponent: React.FC<RenderNodeEntryProps> = ({
  message,
  ...restProps
}) => {
  const chatflowNodeData: ChatflowNodeData | undefined = useMemo(
    () => extractChatflowMessage(message),
    [message],
  );
  if (!chatflowNodeData) {
    return null;
  }
  if (chatflowNodeData.card_type === 'INPUT') {
    return (
      <InputNodeRender
        data={chatflowNodeData}
        message={message}
        {...restProps}
      />
    );
  } else if (chatflowNodeData.card_type === 'QUESTION') {
    return (
      <QuestionNodeRender
        data={chatflowNodeData}
        message={message}
        {...restProps}
      />
    );
  } else {
    return 'content type is not supported';
  }
};

export const WorkflowRenderEntry = memo(BaseComponent, (prevProps, nextProps) =>
  isEqual(omitBy(prevProps, isFunction), omitBy(nextProps, isFunction)),
);
