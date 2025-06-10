import { type JSX } from 'react';

import { Step as SemiStep, Steps as SemiSteps } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { type StepProps } from './step-types';

import './step.css';

const Step = (props: StepProps): JSX.Element => {
  const { description, className, ...restProps } = props;
  const cls = cn(
    'coz-step-item',
    !description && 'coz-step-item-without-desc',
    className,
  );
  return <SemiStep {...restProps} description={description} className={cls} />;
};

Step.displayName = 'Step';

const Steps = SemiSteps;

Object.assign(Steps, { Step });

export { Steps, Step };
