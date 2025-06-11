import React from 'react';

import styles from './index.module.less';

interface CardProps {
  children: React.ReactNode;
}

export const Card = ({ children }: CardProps) => (
  <div className={styles.card}>{children}</div>
);
