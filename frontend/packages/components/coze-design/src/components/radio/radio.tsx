import { forwardRef } from 'react';

import { Radio as SemiRadio } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { radioButtonVariants } from './radio-variant';
import { type RadioProps } from './radio-types';
import { RadioGroup } from './radio-group';

import './index.css';

const RadioComponent = forwardRef<SemiRadio, RadioProps>(
  (props, ref): JSX.Element => {
    const { className, children, ...restProps } = props;

    return (
      <SemiRadio
        className={cn(radioButtonVariants(), className)}
        {...restProps}
        ref={ref}
      >
        {children}
      </SemiRadio>
    );
  },
);

RadioComponent.displayName = 'Radio';

export const Radio = Object.assign(RadioComponent, {
  Group: RadioGroup,
});
