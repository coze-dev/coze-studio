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

import { useEffect, type MutableRefObject } from 'react';

import { useSearchInputStore } from '../search-input-store';
export interface RecommendItemSelectedProps {
  isSelected?: boolean;
  ableKeyPressJump?: boolean;
  onSelectedClick?: () => void;
  itemRef: MutableRefObject<HTMLElement>;
  containerRef: MutableRefObject<HTMLElement>;
}

export const useItemSelect = (props: RecommendItemSelectedProps) => {
  const {
    isSelected,
    ableKeyPressJump,
    onSelectedClick,
    itemRef,
    containerRef,
  } = props;
  const { inputValue, ableKeyBoardJumpDetail } = useSearchInputStore();
  useEffect(() => {
    if (isSelected && ableKeyPressJump && ableKeyBoardJumpDetail) {
      const jumpPage = (e: KeyboardEvent) => {
        if (e.code === 'Enter') {
          onSelectedClick?.();
        }
      };
      document.addEventListener('keydown', jumpPage);

      return () => {
        document.removeEventListener('keydown', jumpPage);
      };
    }
  }, [isSelected, inputValue, ableKeyPressJump, ableKeyBoardJumpDetail]);
  useEffect(() => {
    if (isSelected) {
      if (itemRef?.current && containerRef?.current) {
        const itemRect = itemRef?.current.getBoundingClientRect();
        const containerRect = containerRef?.current.getBoundingClientRect();
        if (itemRect.bottom > containerRect.bottom) {
          containerRef.current.scrollTo({
            top:
              containerRef?.current.scrollTop +
              itemRect.bottom -
              containerRect.bottom +
              8,
            behavior: 'smooth',
          });
        } else if (itemRect.top < containerRect.top) {
          containerRef.current.scrollTo({
            top:
              containerRef?.current.scrollTop +
              itemRect.top -
              containerRect.top,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [isSelected]);
};
