import type { ReactNode } from 'react';

import type { TooltipProps as SemiTooltipProps } from '@douyinfe/semi-ui/lib/es/tooltip';

import type {
  IComponentBaseProps,
  ComponentPosition,
  RenderContent,
} from '@/typings';
import { type Theme } from '@/components/theme';

export type TooltipPosition = ComponentPosition;

export type TooltipTrigger =
  | 'hover'
  | 'focus'
  | 'click'
  | 'contextMenu'
  | 'custom';

export interface TooltipProps extends IComponentBaseProps, SemiTooltipProps {
  content?: ReactNode | RenderContent;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  theme?: Theme;
  visible?: boolean;
  clickToHide?: boolean;
}
