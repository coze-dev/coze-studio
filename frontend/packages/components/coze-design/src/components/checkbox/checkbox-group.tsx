import { forwardRef } from 'react';

import { type CheckboxGroupProps } from '@douyinfe/semi-ui/lib/es/checkbox';
import { CheckboxGroup as SemiCheckboxGroup } from '@douyinfe/semi-ui';

export const CheckboxGroup = forwardRef<SemiCheckboxGroup, CheckboxGroupProps>(
  (props, ref): JSX.Element => {
    const { children, ...restProps } = props;

    return (
      <SemiCheckboxGroup {...restProps} ref={ref}>
        {children}
      </SemiCheckboxGroup>
    );
  },
);

CheckboxGroup.displayName = 'CheckboxGroup';
