import { type Ref, forwardRef } from 'react';

import cs from 'classnames';
import type { ButtonProps as SemiButtonProps } from '@douyinfe/semi-ui/lib/es/button';
import { Button as SemiButton } from '@douyinfe/semi-ui';

import s from './index.module.less';

export type UIButtonProps = SemiButtonProps;

export const Button = forwardRef(
  ({ className, ...props }: SemiButtonProps, ref: Ref<SemiButton>) => (
    <SemiButton
      {...props}
      className={cs(
        className,
        s.button,
        props.theme !== 'borderless' && s['button-min-width'],
        props.size === 'small' && s['button-size-small'],
        props.size === 'default' && s['button-size-default'],
      )}
      ref={ref}
    />
  ),
);

export type Button = SemiButton;
