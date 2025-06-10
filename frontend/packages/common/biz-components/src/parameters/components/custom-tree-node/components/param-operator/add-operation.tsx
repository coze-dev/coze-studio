import React from 'react';

import classNames from 'classnames';
import { UIIconButton } from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';

import styles from './index.module.less';

type AddOperationProps = React.PropsWithChildren<{
  readonly?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}>;

export default function AddOperation({
  readonly,
  onClick,
  className,
  style,
  disabled,
}: AddOperationProps) {
  if (readonly) {
    return null;
  }
  return (
    <UIIconButton
      onClick={onClick}
      className={classNames(
        styles.container,
        disabled ? styles.disabled : null,
        className,
      )}
      style={style}
      icon={<IconAdd className={styles.icon} />}
      disabled={disabled}
    />
  );
}
