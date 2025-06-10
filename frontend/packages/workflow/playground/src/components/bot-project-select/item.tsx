import React, { type PropsWithChildren } from 'react';

import styles from './item.module.less';

interface ItemProps {
  label: string;
  defaultText?: string;
  hideLabel?: boolean;
}

export const Item: React.FC<PropsWithChildren<ItemProps>> = ({
  children,
  label,
  defaultText,
  hideLabel = false,
}) => {
  const haveChildren = !!children;
  const showDefaultText = !haveChildren && !!defaultText;
  const showLabel = !hideLabel && !showDefaultText;

  return (
    <div className={styles.container}>
      {showLabel ? <div className={styles.label}>{label}</div> : null}
      {showDefaultText ? (
        <div className={styles['default-text']}>{defaultText}</div>
      ) : null}
      {children}
    </div>
  );
};
