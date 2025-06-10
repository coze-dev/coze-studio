import { type FC } from 'react';

import { cn, mergeProps } from '@/utils';
import { Typography as SemiTypography } from '@/components/semi';

import { useRenderEllipsis } from './use-ellipsis';
import { titleVariants } from './typography-variant';
import { type TitleProps } from './typography-types';

const { Title: SemiTypographyTitle } = SemiTypography;

import './index.css';

const defaultProps: TitleProps = {
  fontSize: 'inherit',
};

export const Title: FC<TitleProps> = props => {
  const { fontSize, ellipsis, className, ...restProps } = mergeProps(
    props,
    defaultProps,
  );
  const cls = cn(titleVariants({ type: 'title', size: fontSize }), className);
  const renderEllipsis = useRenderEllipsis(ellipsis);
  return (
    <SemiTypographyTitle
      ellipsis={renderEllipsis}
      className={cls}
      {...restProps}
    ></SemiTypographyTitle>
  );
};

Title.displayName = 'COZTitle';
