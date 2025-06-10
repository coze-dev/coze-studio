import type { CSSProperties } from 'react';

import styles from './port.module.less';

interface PortProps {
  id: string;
  type: 'input' | 'output';
  style?: CSSProperties;
}

export function Port({ id, type, style }: PortProps) {
  return (
    <div
      className={styles.port}
      data-port-id={id}
      data-port-type={type}
      style={style}
    />
  );
}
