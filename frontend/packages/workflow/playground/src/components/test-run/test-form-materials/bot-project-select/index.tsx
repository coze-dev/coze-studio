import { type ComponentAdapterCommonProps } from '../../types';
import { FieldName } from '../../constants';
import { type ValueType } from '../../../bot-project-select/types';
import { BotProjectSelectWithField } from '../../../bot-project-select';

export type BotSelectProps = ComponentAdapterCommonProps<
  ValueType | undefined
> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const BotProjectSelectTestset: React.FC<BotSelectProps> = ({
  value,
  ...props
}) => (
  <BotProjectSelectWithField
    field={FieldName.Bot}
    hideLabel={true}
    {...props}
  />
);

export { BotProjectSelectTestset };
