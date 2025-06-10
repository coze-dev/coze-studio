import { type FC } from 'react';

import { cn, mergeProps } from '@/utils';
import { Typography as SemiTypography } from '@/components/semi';

import { useRenderEllipsis } from './use-ellipsis';
import { paragraphVariants } from './typography-variant';
import { type ParagraphProps } from './typography-types';

const { Paragraph: SemiTypographyParagraph } = SemiTypography;

import './index.css';

const defaultProps: ParagraphProps = {
  ellipsis: false,
  fontSize: 'inherit',
};

export const Paragraph: FC<ParagraphProps> = props => {
  const { ellipsis, fontSize, className, ...restProps } = mergeProps(
    props,
    defaultProps,
  );
  const cls = cn(
    paragraphVariants({ type: 'paragraph', size: fontSize }),
    className,
  );

  const renderEllipsis = useRenderEllipsis(ellipsis);

  return (
    <SemiTypographyParagraph
      ellipsis={renderEllipsis}
      className={cls}
      {...restProps}
    ></SemiTypographyParagraph>
  );
};

Paragraph.displayName = 'COZParagraph';
