import React from 'react';

import { RadioGroup } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { singleSelectVariants } from './single-select-variant';
import { type SingleSelectProps } from './single-select-types';
import { SingleSelectLabel } from './single-select-label';

import './index.css';

const defaultProps: Partial<SingleSelectProps> = {
  layout: 'hug',
};

export const SingleSelectComp: React.FC<SingleSelectProps> = props => {
  const { className, layout, size, ...rest } = { ...defaultProps, ...props };

  const classes = cn(singleSelectVariants({ layout, size }), className);

  return <RadioGroup {...rest} className={classes} type="button" />;
};

SingleSelectComp.displayName = 'SingleSelect';

export const SingleSelect = Object.assign(SingleSelectComp, {
  SingleSelectLabel,
});
