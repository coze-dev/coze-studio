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

export interface InputWorkflowNode {
  content_type: 'form_schema';
  content: { type: string; name: string }[];
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
