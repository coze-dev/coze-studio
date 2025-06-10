import { type NumeralProps as SemiNumeralProps } from '@douyinfe/semi-ui/lib/es/typography/numeral';
import {
  type ShowTooltip as SemiShowTooltip,
  type Ellipsis as SemiEllipsis,
  type BaseTypographyProps,
  type TextProps as SemiTextProps,
  type ParagraphProps as SemiParagraphProps,
  type TitleProps as SemiTitleProps,
} from '@douyinfe/semi-ui/lib/es/typography';

import { type IComponentBaseProps } from '@/typings';
import { type TooltipProps } from '@/components/tooltip';
import { type PopoverProps } from '@/components/popover';

export type BaseSize = '16px' | '14px' | '12px' | 'inherit';

export type TitleSize = '28px' | '20px' | BaseSize;

export type TextSize = '10px' | BaseSize;

export interface TypographyProps
  extends IComponentBaseProps,
    BaseTypographyProps {}

export interface TitleProps extends IComponentBaseProps, SemiTitleProps {
  fontSize?: TitleSize;
  ellipsis?: Ellipsis | undefined | boolean;
}

export interface TextProps extends IComponentBaseProps, SemiTextProps {
  fontSize?: TextSize;
  ellipsis?: Ellipsis | undefined | boolean;
}

export interface Ellipsis extends Omit<SemiEllipsis, 'showTooltip'> {
  showTooltip?: ShowTooltip | boolean;
}

export interface ShowTooltip extends SemiShowTooltip {
  opts?: TooltipProps & PopoverProps;
}

export interface ParagraphProps
  extends IComponentBaseProps,
    Omit<SemiParagraphProps, 'ellipsis'> {
  fontSize?: BaseSize;
  ellipsis?: Ellipsis | undefined | boolean;
}

export interface NumeralProps extends IComponentBaseProps, SemiNumeralProps {}
