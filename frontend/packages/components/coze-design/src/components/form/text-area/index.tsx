import { type FC, forwardRef, type Ref } from 'react';

import { withField } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { TextArea, type TextAreaProps } from '@/components/textarea';
import { type CommonFieldProps } from '@/components/semi/types';

import { formFieldClassName } from '../form.variant';

const TextAreaInner: typeof TextArea = withField(TextArea, {});

export const FormTextArea: FC<CommonFieldProps & TextAreaProps> = forwardRef(
  ({ fieldClassName, ...props }, ref) => (
    <TextAreaInner
      ref={ref as Ref<HTMLTextAreaElement>}
      {...props}
      wrapperClassName={cn(formFieldClassName(), fieldClassName)}
    />
  ),
);
