import { withField } from '@coze/coze-design';

import { ExpressionEditorContainer } from '../expression-editor/container';

const MessageContent = props => {
  const { value, onChange, context, placeholder, validateStatus } = props;

  return (
    <ExpressionEditorContainer
      onChange={onChange}
      value={value}
      context={context}
      placeholder={placeholder}
      isError={validateStatus === 'error'}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MessageContentField: any = withField(MessageContent);
