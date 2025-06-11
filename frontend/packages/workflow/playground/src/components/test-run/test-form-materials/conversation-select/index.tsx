import { type ComponentAdapterCommonProps } from '../../types';
import { FieldName } from '../../constants';
import { ConversationSelectWithField } from '../../../conversation-select';

type ConversationSelectProps = ComponentAdapterCommonProps<string> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const ConversationSelectTestset: React.FC<ConversationSelectProps> = ({
  value,
  ...props
}) => <ConversationSelectWithField field={FieldName.Chat} {...props} />;

export { ConversationSelectTestset };
