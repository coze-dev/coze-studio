/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
import React, { useState, useEffect, useRef } from 'react';

import { chunk } from 'lodash-es';
import cls from 'classnames';
import {
  IconCozArrowRight,
  IconCozArrowLeft,
} from '@coze-arch/coze-design/icons';

import { CarouselItem } from './carousel-item';

import styles from './index.module.less';

export interface CarouselProps {
  /** 元素布局行数默认为1 */
  rows?: number;
  /** 元素布局列数，默认为均分数组 */
  column?: number;
  /** 每次点击箭头滚动的百分比，0~1. 默认值为0.5 */
  scrollStep?: number;
  /** 滚动回调 */
  onScroll?: () => void;
  /** 箭头是否显示边框 */
  enableArrowBorder?: boolean;
  /** 箭头是否显示阴影渐变 */
  enableArrowShalldow?: boolean;
  /** 子元素样式 */
  itemClassName?: string;
  /** 左箭头样式 */
  leftArrowClassName?: string;
  /** 右箭头样式 */
  rightArrowClassName?: string;
  children: React.ReactNode;
}

interface ArrowProps {
  className?: string;
  enableArrowBorder?: boolean;
  enableArrowShalldow?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const LeftArrow = ({
  enableArrowBorder,
  enableArrowShalldow,
  className,
  onClick,
}: ArrowProps) => (
  <div
    className={cls(
      styles['arrow-container'],
      { [styles.left]: enableArrowShalldow },
      'arrow-container-left',
    )}
  >
    <div
      onClick={onClick}
      className={cls(
        className,
        styles['left-arrow'],
        styles.arrow,
        'left-arrow',
        {
          [styles['no-border']]: !enableArrowBorder,
        },
      )}
    >
      <IconCozArrowLeft />
    </div>
  </div>
);

const RightArrow = ({
  enableArrowBorder,
  enableArrowShalldow,
  className,
  onClick,
}: ArrowProps) => (
  <div
    className={cls(
      styles['arrow-container'],
      { [styles.right]: enableArrowShalldow },
      'arrow-container-right',
    )}
  >
    <div
      onClick={onClick}
      className={cls(
        className,
        styles['right-arrow'],
        styles.arrow,
        'right-arrow',
        {
          [styles['no-border']]: !enableArrowBorder,
        },
      )}
    >
      <IconCozArrowRight />
    </div>
  </div>
);

export const Carousel: React.FC<CarouselProps> = ({
  rows = 1,
  column,
  itemClassName = '',
  leftArrowClassName = '',
  rightArrowClassName = '',
  children,
  enableArrowShalldow = true,
  scrollStep = 0.5,
  enableArrowBorder = true,
  onScroll,
}) => {
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const [leftArrowVisible, setLeftArrowVisible] = useState(false);
  const [rightArrowVisible, setRightArrowVisible] = useState(false);
  if (!children) {
    return null;
  }
  const carouselItems = React.Children.map(
    children,
    (child: React.ReactNode, idx: number) => (
      <CarouselItem className={itemClassName} key={idx}>
        {child}
      </CarouselItem>
    ),
  );
  const chunkedCarouselItems: React.ReactNode[][] = chunk(
    carouselItems,
    column ?? Math.ceil((carouselItems?.length || 0) / rows),
  );
  const rowItems = Array.from(Array(rows).fill(null)).map((_row, idx) => (
    <div className={cls(styles['carousel-row'], 'carousel-row')} key={idx}>
      {chunkedCarouselItems[idx]}
    </div>
  ));
  const handleScrollLeft = () => {
    if (
      itemsContainerRef?.current?.scrollLeft !== undefined &&
      itemsContainerRef?.current?.clientWidth
    ) {
      // 部分浏览器不支持 scrollTo 方法
      itemsContainerRef.current.scrollTo?.({
        left: Math.max(
          itemsContainerRef.current.scrollLeft -
            itemsContainerRef.current.clientWidth * scrollStep,
          0,
        ),
        behavior: 'smooth',
      });
    }
  };
  const handleScrollRight = () => {
    const containWidth = itemsContainerRef?.current?.clientWidth ?? 0;
    if (itemsContainerRef?.current?.scrollLeft !== undefined && containWidth) {
      const scrollLeftMax =
        (itemsContainerRef?.current?.scrollWidth ?? 0) -
        (itemsContainerRef?.current?.clientWidth ?? 0);
      itemsContainerRef.current.scrollTo?.({
        left: Math.min(
          itemsContainerRef.current.scrollLeft + containWidth * scrollStep,
          scrollLeftMax,
        ),
        behavior: 'smooth',
      });
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
  useEffect(() => {
    const updateArrowVisible = () => {
      const scrollLeft = Math.ceil(itemsContainerRef?.current?.scrollLeft ?? 0);
      const scrollRight =
        (itemsContainerRef?.current?.scrollWidth ?? 0) -
        (itemsContainerRef?.current?.clientWidth ?? 0) -
        scrollLeft;

      const shouldShowArrowLeft = scrollLeft > 0;
      // 极端场景下存在 1px 偏差
      const shouldShowArrowRight = Math.abs(scrollRight) > 2;

      setLeftArrowVisible(shouldShowArrowLeft);
      setRightArrowVisible(shouldShowArrowRight);
    };
    const scrollEvent = () => {
      onScroll?.();
      updateArrowVisible();
    };

    // 初始化时判读一次是否显示箭头
    updateArrowVisible();
    itemsContainerRef?.current?.addEventListener('scroll', scrollEvent);
    window?.addEventListener('resize', updateArrowVisible);
    return () => {
      itemsContainerRef?.current?.removeEventListener('scroll', scrollEvent);
      window?.removeEventListener('resize', updateArrowVisible);
    };
  }, [children]);

  return (
    <div className={cls(styles.carousel, 'carousel')}>
      {leftArrowVisible ? (
        <LeftArrow
          onClick={handleScrollLeft}
          enableArrowBorder={enableArrowBorder}
          enableArrowShalldow={enableArrowShalldow}
          className={leftArrowClassName}
        />
      ) : null}
      <div
        className={cls(styles['carousel-content'], 'carousel-content')}
        ref={itemsContainerRef}
      >
        {rowItems}
      </div>
      {rightArrowVisible ? (
        <RightArrow
          onClick={handleScrollRight}
          enableArrowBorder={enableArrowBorder}
          enableArrowShalldow={enableArrowShalldow}
          className={rightArrowClassName}
        />
      ) : null}
    </div>
  );
};
