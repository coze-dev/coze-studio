import { type FC, useRef } from 'react';

import { type CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form';
import { withField } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { Input, type InputProps } from '@/components/input';

import { formFieldClassName } from '../form.variant';

const InputInner = withField(Input, {});

export const FormInput: FC<CommonFieldProps & InputProps> = ({
  fieldClassName,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <InputInner
      {...props}
      fieldClassName={cn(formFieldClassName(), fieldClassName)}
      ref={inputRef}
    />
  );
};
