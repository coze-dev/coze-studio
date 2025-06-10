import { type FC } from 'react';

import { cn } from '@/utils';
import { Typography as SemiTypography } from '@/components/semi';

import { numeralVariants } from './typography-variant';
import { type NumeralProps } from './typography-types';

const { Numeral: SemiTypographyNumeral } = SemiTypography;

import './index.css';

export const Numeral: FC<NumeralProps> = props => {
  const { className, ...restProps } = props;
  const cls = cn(numeralVariants({ type: 'numeral' }), className);
  return (
    <SemiTypographyNumeral
      className={cls}
      {...restProps}
    ></SemiTypographyNumeral>
  );
};

Numeral.displayName = 'COZNumeral';
