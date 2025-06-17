import { forwardRef } from 'react';

import classNames from 'classnames';
import { IconButton, type ButtonProps } from '@coze-arch/coze-design';
import { type Button as SemiButton } from '@douyinfe/semi-ui';

import styles from './index.module.less';

export const OutlinedIconButton = forwardRef<
  SemiButton,
  ButtonProps & { showBackground: boolean }
>(({ className, showBackground, ...restProps }, ref) => (
  <IconButton
    ref={ref}
    className={classNames(
      className,
      showBackground
        ? ['!coz-bg-image-bots', styles['outlined-icon-button-background']]
        : styles['outlined-icon-button'],
      styles['base-outlined-icon-button'],
    )}
    {...restProps}
  />
));
