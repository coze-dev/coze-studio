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

import { useEffect, useRef, useState } from 'react';

interface ScrollControlProps {
  activeTab: string;
  tabs: string[];
  loading?: boolean;
  data?: Record<string, unknown>;
}

export const useScrollControl = ({
  activeTab,
  tabs,
  loading,
  data,
}: ScrollControlProps) => {
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getTabIndex = (tab: string) => tabs.indexOf(tab);

  const checkScrollable = (index: number) => {
    const scrollRef = scrollRefs.current[index];
    if (scrollRef) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const index = getTabIndex(activeTab);
    if (scrollRefs.current[index]) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollRefs.current[index].scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRefs.current[index].scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleResize = () => checkScrollable(getTabIndex(activeTab));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  useEffect(() => {
    if (!loading && data?.[activeTab]) {
      setTimeout(() => checkScrollable(getTabIndex(activeTab)), 0);
    }
  }, [loading, data, activeTab]);

  useEffect(() => {
    const scrollElement = scrollRefs.current[getTabIndex(activeTab)];
    if (!scrollElement) {
      return;
    }
    const onScroll = () => checkScrollable(getTabIndex(activeTab));
    scrollElement.addEventListener('scroll', onScroll);
    checkScrollable(getTabIndex(activeTab));
    return () => scrollElement.removeEventListener('scroll', onScroll);
  }, [data, activeTab]);

  return {
    scrollRefs,
    canScrollLeft,
    canScrollRight,
    handleScroll,
  };
};
