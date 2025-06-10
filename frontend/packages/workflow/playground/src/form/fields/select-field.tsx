import { useField } from '../hooks';
import { withField } from '../hocs';
import {
  type FieldProps,
  Select,
  type SelectProps as BaseSelectProps,
} from '../components';

type SelectProps = Omit<
  BaseSelectProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'hasError'
>;

export const SelectField: React.FC<SelectProps & FieldProps> =
  withField<SelectProps>(props => {
    const { value, onChange, onBlur, errors, readonly } = useField<
      string | number
    >();

    return (
      <Select
        {...props}
        disabled={readonly}
        value={value}
        onChange={v => onChange(v as string | number)}
        onBlur={onBlur}
        hasError={errors && errors.length > 0}
      />
    );
  });
