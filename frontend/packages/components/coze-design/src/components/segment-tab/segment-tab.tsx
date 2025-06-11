import { forwardRef } from 'react';

import { RadioGroup, Radio } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { segmentTabVariants } from './segment-tab-variant';
import { type SegmentTabProps } from './segment-tab-types';

import './index.css';

const SegmentTabComponent = forwardRef<RadioGroup, SegmentTabProps>(
  (props, ref): JSX.Element => {
    const { size = 'default', className, ...restProps } = props;

    const cls = cn(
      segmentTabVariants({
        size,
      }),
      className,
    );

    return (
      <RadioGroup ref={ref} type="button" className={cls} {...restProps} />
    );
  },
);

const Tab = Radio;

const SegmentTab = Object.assign(SegmentTabComponent, { Tab });

SegmentTab.displayName = 'SegmentTab';

export { SegmentTab };
