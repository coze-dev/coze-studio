import { forwardRef } from 'react';

import cs from 'classnames';
import { TextArea, withField } from '@coze-arch/coze-design';

import s from './index.module.less';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextAreaInner: any = withField(TextArea, {});
export const CozeFormTextArea: typeof TextAreaInner = forwardRef(
  // @ts-expect-error -- to fix
  ({ fieldClassName, ...props }, ref) => (
    <TextAreaInner
      ref={ref}
      {...props}
      fieldClassName={cs(fieldClassName, s.field)}
    />
  ),
);
