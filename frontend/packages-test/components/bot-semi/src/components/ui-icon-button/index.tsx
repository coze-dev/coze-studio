import { LegacyRef, forwardRef } from 'react';

import cs from 'classnames';
import { ButtonProps } from '@douyinfe/semi-ui/lib/es/button';
import { Button } from '@douyinfe/semi-ui';

import s from './index.module.less';

export interface UIIconButtonProps extends ButtonProps {
  wrapperClass?: string;
  /**
   * iconSize: 带hover大小，small:18、default:24、large:32
   */
  iconSize?: 'small' | 'default' | 'large';
}

//图标按钮组件
export const UIIconButton = forwardRef(
  (
    {
      className,
      wrapperClass,
      iconSize = 'default',
      ...props
    }: UIIconButtonProps,
    ref: LegacyRef<Button>,
  ) => (
    <div
      className={cs(
        s['icon-button'],
        s[`icon-button-${iconSize}`],
        wrapperClass,
      )}
    >
      <Button
        ref={ref}
        className={cs(className)}
        {...props}
        size="small"
        theme="borderless"
      />
    </div>
  ),
);
export default UIIconButton;
