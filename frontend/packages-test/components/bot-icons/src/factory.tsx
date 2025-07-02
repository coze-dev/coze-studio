import { type ReactNode, type Ref, forwardRef } from 'react';

import Icon, { type IconProps } from '@douyinfe/semi-icons';

export const IconFactory = (svg: ReactNode) =>
  forwardRef(
    (props: Omit<IconProps, 'svg' | 'ref'>, ref: Ref<HTMLSpanElement>) => (
      <Icon svg={svg} {...props} ref={ref} />
    ),
  );
