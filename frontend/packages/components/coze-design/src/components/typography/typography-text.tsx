import { type FC } from 'react';

import { cn, mergeProps } from '@/utils';
import { Typography as SemiTypography } from '@/components/semi';

import { useRenderEllipsis } from './use-ellipsis';
import { textVariants } from './typography-variant';
import { type TextProps } from './typography-types';

const { Text: SemiTypographyText } = SemiTypography;

import './index.css';

const defaultProps: TextProps = {
  fontSize: 'inherit',
  ellipsis: false,
};

export const Text: FC<TextProps> = props => {
  const { fontSize, ellipsis, className, ...restProps } = mergeProps(
    props,
    defaultProps,
  );
  const cls = cn(textVariants({ type: 'text', size: fontSize }), className);
  const renderEllipsis = useRenderEllipsis(ellipsis);
  return (
    <SemiTypographyText
      ellipsis={renderEllipsis}
      className={cls}
      {...restProps}
    ></SemiTypographyText>
  );
};

Text.displayName = 'COZText';
