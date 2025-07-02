import { Ref, forwardRef } from 'react';

import cs from 'classnames';
import type { InputProps } from '@douyinfe/semi-ui/lib/es/input';
import { Input as SemiInput } from '@douyinfe/semi-ui';

import s from './index.module.less';

export const Input = forwardRef(
  ({ className, ...props }: InputProps, ref: Ref<HTMLInputElement>) => (
    <SemiInput className={cs(className, s['ui-input'])} {...props} ref={ref} />
  ),
);
