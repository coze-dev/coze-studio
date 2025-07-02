import { type ReactNode } from 'react';

export interface ToolButtonCommonProps {
  onClick?: () => void;
  tooltips?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  [key: `data-${string}`]: string;
}
