import { forwardRef } from 'react';

import { Checkbox as SemiCheckbox } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { type CheckboxProps } from './checkbox-types';
import { CheckboxGroup } from './checkbox-group';
import './index.css';

const CheckboxComponent = forwardRef<SemiCheckbox, CheckboxProps>(
  (props, ref): JSX.Element => {
    const { children, className, ...restProps } = props;

    return (
      <SemiCheckbox
        {...restProps}
        className={cn('coz-checkbox', className)}
        ref={ref}
      >
        {children}
      </SemiCheckbox>
    );
  },
);

CheckboxComponent.displayName = 'Checkbox';

export const Checkbox = Object.assign(CheckboxComponent, {
  Group: CheckboxGroup,
});
