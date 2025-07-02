import {
  Input,
  type InputProps as BaseInputProps,
} from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';
import { type FieldProps } from '../components';

type InputProps = Omit<
  BaseInputProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const InputField: React.FC<InputProps & FieldProps> =
  withField<InputProps>(props => {
    const { value, onChange, onBlur, errors } = useField<string>();

    return (
      <Input
        {...props}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        size="small"
        error={errors && errors.length > 0}
      />
    );
  });
