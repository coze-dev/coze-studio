import { type FC, useRef } from 'react';

import { type UploadProps } from '@douyinfe/semi-ui/lib/es/upload';
import { type CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form';
import { withField } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { Upload } from '@/components/semi';

import { formFieldClassName } from '../form.variant';

const UploadInner = withField(Upload, {});

export const FormUpload: FC<CommonFieldProps & UploadProps> = ({
  fieldClassName,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <UploadInner
        {...props}
        fieldClassName={cn(formFieldClassName(), fieldClassName)}
        ref={inputRef}
      />
    </div>
  );
};
