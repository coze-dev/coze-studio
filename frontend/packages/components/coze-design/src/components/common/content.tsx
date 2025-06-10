import type { FC, CSSProperties, ReactNode } from 'react';
import './content.css';

export const Content: FC<{
  className?: string;
  children: string | ReactNode;
  style?: CSSProperties;
}> = ({ children, className, style = {} }) => (
  <div
    className={`coz-common-content leading-[20px] ${className || ''}`}
    style={style}
  >
    {children}
  </div>
);
