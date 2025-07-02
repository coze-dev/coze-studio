import cx from 'classnames';
import { TextArea, type TextAreaProps } from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';

type TextareaProps = Omit<TextAreaProps, 'value' | 'onChange'>;

export const TextareaField = withField(
  ({ className = '', ...props }: TextareaProps) => {
    const { value, onChange, readonly = false } = useField<string>();

    return (
      <TextArea
        className={cx(
          className,
          'w-full',
          readonly ? 'pointer-events-none' : '',
        )}
        value={value}
        onChange={v => onChange?.(v)}
        {...props}
      />
    );
  },
);
