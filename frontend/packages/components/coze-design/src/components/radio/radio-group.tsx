import { forwardRef } from 'react';

import { type RadioGroupProps } from '@douyinfe/semi-ui/lib/es/radio';
import { RadioGroup as SemiRadioGroup } from '@douyinfe/semi-ui';

export const RadioGroup = forwardRef<SemiRadioGroup, RadioGroupProps>(
  (props, ref): JSX.Element => {
    const { children, ...restProps } = props;

    return (
      <SemiRadioGroup {...restProps} ref={ref}>
        {children}
      </SemiRadioGroup>
    );
  },
);

RadioGroup.displayName = 'RadioGroup';
