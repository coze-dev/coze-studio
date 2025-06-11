import type { PropsWithChildren } from 'react';

import classNames from 'classnames';
import './index.less';

/**
 * 套壳组件，默认宽度通栏，用于帮助孤立组件与 message box 保持宽度对齐
 */
export const FullWidthAligner = (
  props: PropsWithChildren<{
    alignWidth?: string;
    className?: string;
    innerWrapClassName?: string;
  }>,
) => {
  const { alignWidth, children, className, innerWrapClassName } = props;
  return (
    <div
      className={classNames('full-width-aligner', className)}
      style={{
        width: alignWidth || '100%',
      }}
    >
      <span
        className={classNames(
          'full-width-aligner-inner-wrap',
          innerWrapClassName,
        )}
      >
        {children}
      </span>
    </div>
  );
};

FullWidthAligner.displayName = 'UIKitFullWidthAligner';
