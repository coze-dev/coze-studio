import { type ComponentAdapterCommonProps } from '../../types';
import { FieldName } from '../../constants';
import { BotSelectWithField } from '../../../bot-select';

type BotSelectProps = ComponentAdapterCommonProps<string> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
const BotSelectTestset: React.FC<BotSelectProps> = ({ value, ...props }) => (
  <BotSelectWithField field={FieldName.Bot} hideLabel={true} {...props} />
);

export { BotSelectTestset };
