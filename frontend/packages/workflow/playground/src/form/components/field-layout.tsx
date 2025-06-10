import { type ReactNode } from 'react';

import { Label } from './label';

export interface FieldLayoutProps {
  label?: ReactNode;
  labelExtra?: ReactNode;
  tooltip?: ReactNode;
  required?: boolean;
  layout?: 'vertical' | 'horizontal';
  children: ReactNode;
}

export const FieldLayout = ({
  label,
  labelExtra,
  tooltip,
  required = false,
  layout = 'horizontal',
  children,
}: FieldLayoutProps) =>
  label ? (
    <div className={layout === 'horizontal' ? 'flex gap-[4px] min-w-0' : ''}>
      <Label
        className={layout === 'horizontal' ? 'w-[148px]' : ''}
        required={required}
        tooltip={tooltip}
        extra={labelExtra}
      >
        {label}
      </Label>
      <div className="last:flex-1 min-w-0">{children}</div>
    </div>
  ) : (
    children
  );
