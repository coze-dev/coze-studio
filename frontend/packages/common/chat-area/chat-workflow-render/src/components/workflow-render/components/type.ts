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
  /** 嵌套的 stringify 数据, 需要二次 parse */
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
