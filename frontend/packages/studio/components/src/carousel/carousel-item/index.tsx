import React from 'react';

import cls from 'classnames';

import styles from './index.module.less';

export interface CarouselItemProps {
  className?: string;
  children: React.ReactNode;
}

export const CarouselItem: React.FC<CarouselItemProps> = props => {
  const { children, className } = props;
  return (
    <div className={cls(styles['carousel-item'], className, 'carousel-item')}>
      {children}
    </div>
  );
};
