import React from 'react';

import { withField } from '@coze-arch/bot-semi';

import { Conversations } from './conversations';

interface ConversationSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const ConversationSelect: React.FC<ConversationSelectProps> = ({
  value,
  onChange,
  ...props
}) => <Conversations value={value} onChange={onChange} {...props} />;

export const ConversationSelectWithField = withField(ConversationSelect, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});

ConversationSelectWithField.defaultProps = {
  fieldStyle: { overflow: 'visible' },
};
