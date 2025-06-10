import type { FC, CSSProperties, ReactNode } from 'react';
import './description.css';

export const Description: FC<{
  className?: string;
  children: string | ReactNode;
  style?: CSSProperties;
}> = ({ children, className, style = {} }) => (
  <div
    className={`coz-common-description leading-[20px] ${className || ''}`}
    style={style}
  >
    {children}
  </div>
);
