import { useEffect, useRef, useState, type FC } from 'react';

import { Tooltip, type TooltipProps } from '@/components/tooltip';

export interface TitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  tooltipOpts?: TooltipProps;
}
export const Text: FC<TitleProps> = props => {
  const textRef = useRef<HTMLDivElement>();
  const { children, tooltipOpts, className, ...rest } = props;
  const [isOverflow, setIsOverflow] = useState(false);
  useEffect(() => {
    if (textRef.current) {
      const _isOverflow =
        textRef.current.scrollWidth > textRef.current?.clientWidth;
      if (_isOverflow && !isOverflow) {
        setIsOverflow(true);
      }
    }
  }, [children]);

  return isOverflow ? (
    <Tooltip content={children} {...tooltipOpts}>
      {/* @ts-expect-error -- linter-disable-autofix */}
      <div className={`${className} truncate`} ref={textRef} {...rest}>
        {children}
      </div>
    </Tooltip>
  ) : (
    // @ts-expect-error -- linter-disable-autofix
    <div className={`${className} truncate`} ref={textRef} {...rest}>
      {children}
    </div>
  );
};
