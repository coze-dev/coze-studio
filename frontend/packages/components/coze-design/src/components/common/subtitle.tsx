import { type FC } from 'react';
import './subtitle.css';

export const SubTitle: FC<{
  className?: string;
  children: string | React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, className, style = {} }) => (
  <div
    className={`coz-common-subtitle leading-[16px] ${className || ''}`}
    style={style}
  >
    {children}
  </div>
);
