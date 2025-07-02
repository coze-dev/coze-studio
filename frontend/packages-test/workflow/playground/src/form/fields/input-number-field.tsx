import { useNodeTestId } from '@coze-workflow/base';
import {
  CozInputNumber,
  type InputNumberProps as BaseInputNumberProps,
} from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';
import { type FieldProps } from '../components';

type InputNumberProps = Omit<
  BaseInputNumberProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const InputNumberField: React.FC<InputNumberProps & FieldProps> =
  withField<InputNumberProps>(props => {
    const { name, value, onChange, onBlur, errors, readonly } = useField<
      number | string
    >();
    const { getNodeSetterId } = useNodeTestId();

    return (
      <CozInputNumber
        {...props}
        disabled={readonly}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        size="small"
        error={errors && errors.length > 0}
        data-testid={getNodeSetterId(name)}
      />
    );
  });
