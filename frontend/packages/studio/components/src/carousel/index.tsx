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
  /** The number of rows in the element layout defaults to 1. */
  rows?: number;
  /** Number of element layout columns, the default is to divide the array equally */
  column?: number;
  /** Percentage of scrolling per click of arrow, 0~ 1. Default value is 0.5 */
  scrollStep?: number;
  /** scrolling callback */
  onScroll?: () => void;
  /** Whether the arrow shows the border */
  enableArrowBorder?: boolean;
  /** Whether the arrows show gradual changes in shadows */
  enableArrowShalldow?: boolean;
  /** child style */
  itemClassName?: string;
  /** Left Arrow Style */
  leftArrowClassName?: string;
  /** Right Arrow Style */
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
      // Some browsers do not support the scrollTo method
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
      // There is a 1px bias in extreme scenarios
      const shouldShowArrowRight = Math.abs(scrollRight) > 2;

      setLeftArrowVisible(shouldShowArrowLeft);
      setRightArrowVisible(shouldShowArrowRight);
    };
    const scrollEvent = () => {
      onScroll?.();
      updateArrowVisible();
    };

    // Determine whether to display arrows once during initialization
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
