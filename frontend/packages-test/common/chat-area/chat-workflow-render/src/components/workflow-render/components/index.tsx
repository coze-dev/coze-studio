import { memo } from 'react';

import { isEqual, isFunction, noop, omitBy } from 'lodash-es';
import { typeSafeJsonParse } from '@coze-common/chat-area-utils';

import { isWorkflowNodeData } from './utils';
import { type RenderNodeEntryProps } from './type';
import { QuestionNodeRender } from './question-node-render';
import { InputNodeRender } from './input-node-render';

const BaseComponent: React.FC<RenderNodeEntryProps> = ({
  message,
  ...restProps
}) => {
  const data = typeSafeJsonParse(message.content, noop);
  if (!isWorkflowNodeData(data)) {
    return 'card content is not supported';
  }

  if (data.content_type === 'option') {
    return <QuestionNodeRender data={data} message={message} {...restProps} />;
  }
  if (data.content_type === 'form_schema') {
    return <InputNodeRender data={data} message={message} {...restProps} />;
  }
  return 'content type is not supported';
};

export const WorkflowRenderEntry = memo(BaseComponent, (prevProps, nextProps) =>
  isEqual(omitBy(prevProps, isFunction), omitBy(nextProps, isFunction)),
);
