import { type CSSProperties } from 'react';

export interface ToNewestTipProps {
  onClick: () => void;
  style?: CSSProperties;
  className?: string;
  show?: boolean;
  showBackground: boolean;
}
