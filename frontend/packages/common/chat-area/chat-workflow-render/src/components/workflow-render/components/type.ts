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
  type IEventCallbacks,
  type IMessage,
} from '@coze-common/chat-uikit-shared';

export interface QuestionWorkflowNode {
  type: 'question';
  content_type: 'option';
  content: {
    question: string;
    options: { name: string }[];
  };
}

type StringifyInputWorkflowNodeContent = string;

export interface InputWorkflowNode {
  content_type: 'form_schema';
  /** Nested stringified data, requires secondary parsing */
  content: StringifyInputWorkflowNodeContent;
}

export interface InputWorkflowNodeContent {
  type: string;
  name: string;
}

export type WorkflowNode = QuestionWorkflowNode | InputWorkflowNode;

interface RenderNodeBaseProps extends Pick<IEventCallbacks, 'onCardSendMsg'> {
  isDisable: boolean | undefined;
  readonly: boolean | undefined;
}
export interface RenderNodeEntryProps extends RenderNodeBaseProps {
  message: IMessage;
}

export interface QuestionRenderNodeProps extends RenderNodeEntryProps {
  data: QuestionWorkflowNode;
}

export interface InputRenderNodeProps extends RenderNodeEntryProps {
  data: InputWorkflowNode;
}
