import {
  Switch,
  type SwitchProps as BaseSwitchProps,
} from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';
import { type FieldProps } from '../components';

type SwitchProps = Omit<
  BaseSwitchProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const SwitchField: React.FC<SwitchProps & FieldProps> =
  withField<SwitchProps>(props => {
    const { value, onChange, readonly } = useField<boolean>();

    return (
      <Switch
        {...props}
        disabled={readonly}
        checked={value}
        onChange={onChange}
      />
    );
  });
