import {
  Checkbox,
  type CheckboxProps as BaseCheckboxProps,
} from '@coze/coze-design';

import { withField, useField } from '@/form';

type CheckboxProps = Omit<
  BaseCheckboxProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const CheckboxField = withField<CheckboxProps>(props => {
  const { value, onChange } = useField<boolean>();

  return (
    <div className="flex h-[24px] items-center">
      <Checkbox
        {...props}
        value={value}
        onChange={e => onChange(!!e.target.checked)}
      />
    </div>
  );
});
