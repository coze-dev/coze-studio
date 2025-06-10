import { Typography as SemiTypography } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { type TypographyProps } from './typography-types';
import { Title } from './typography-title';
import { Text } from './typography-text';
import { Paragraph } from './typography-paragraph';
import { Numeral } from './typography-numeral';

import './index.css';

export const BaseTypography = (props: TypographyProps) => {
  const { className, ...restProps } = props;
  const cls = cn(className, 'coz-typography');
  return <SemiTypography className={cls} {...restProps} />;
};

export const Typography = Object.assign(BaseTypography, {
  Title,
  Text,
  Paragraph,
  Numeral,
});
