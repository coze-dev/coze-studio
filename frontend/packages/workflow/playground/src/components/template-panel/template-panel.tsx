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

import React, { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import {
  DataSourceType,
  WorkflowModalContext,
  type WorkflowModalContextValue,
} from '@coze-workflow/components';
import { WorkflowMode } from '@coze-arch/idl/developer_api';

import { useTemplateService } from '@/hooks/use-template-service';
import { useGlobalState } from '@/hooks';

import { PanelWrap } from '../float-layout';
import { TemplateSlideButton } from './template-slide-button';
import { TemplateCardList } from './template-card-list';

import styles from './index.module.less';

export const TemplatePanel = () => {
  const { spaceId, readonly } = useGlobalState();

  const templateState = useTemplateService();

  const [isLeftSlidable, setLeftSlidable] = useState(true);
  const [isRightSlidable, setRightSlidable] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isCardsOver =
    (scrollRef?.current?.scrollWidth as number) >
    (containerRef?.current?.scrollWidth as number);

  const scrollAction = useRef<string>('');

  const handleClickSlide = useCallback(
    (direction: 'left' | 'right') => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) {
        return;
      }
      const scrollAmount = 400;
      const currentScrollLeft = scrollContainer?.scrollLeft ?? 0;

      let newScrollLeft = 0;
      if (direction === 'left') {
        newScrollLeft = Math.max(currentScrollLeft - scrollAmount, 0);
        // Set the left swipe button disabled state
      } else if (direction === 'right') {
        newScrollLeft = Math.min(
          currentScrollLeft + scrollAmount,
          scrollContainer.scrollWidth - scrollContainer.clientWidth,
        );
      }

      scrollAction.current = 'click';

      scrollContainer.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    },
    [setLeftSlidable, setRightSlidable],
  );

  // Check if it can be scrolled.
  const checkScrollability = () => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }
    setLeftSlidable(scrollElement.scrollLeft > 0);
    setRightSlidable(
      scrollElement.scrollWidth > scrollElement.clientWidth &&
        Math.ceil(scrollElement.scrollLeft) <
          scrollElement.scrollWidth - scrollElement.clientWidth,
    );
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }

    // Monitor width change
    const resizeObserver = new ResizeObserver(() => {
      checkScrollability();
    });
    resizeObserver.observe(scrollElement);

    // listen for scrolling events
    scrollElement.addEventListener('scroll', checkScrollability);

    return () => {
      if (scrollElement) {
        resizeObserver.unobserve(scrollElement);
        scrollElement.removeEventListener('scroll', checkScrollability);
      }
    };
  }, []);

  const contextValue = {
    spaceId: spaceId ?? '',
    flowMode: WorkflowMode.Workflow,
    modalState: DataSourceType.Workflow,
  } as unknown as WorkflowModalContextValue;

  if (readonly) {
    return;
  }

  return (
    <PanelWrap
      className={classNames(styles['template-panel-container'], {
        [styles['template-slide-down']]: !templateState.templateVisible,
      })}
      style={{
        paddingTop: '0px',
      }}
    >
      <WorkflowModalContext.Provider value={contextValue}>
        <div ref={containerRef} className="relative flex overflow-hidden">
          <TemplateCardList
            ref={scrollRef}
            workflowTemplateList={templateState.templateList}
            isCardsOver={isCardsOver}
          />
        </div>
      </WorkflowModalContext.Provider>

      <TemplateSlideButton
        onTemplateScorll={handleClickSlide}
        templateVisible={templateState.templateList?.length > 0}
        slidable={isLeftSlidable}
        direction={'left'}
      />
      <TemplateSlideButton
        onTemplateScorll={handleClickSlide}
        templateVisible={templateState.templateList?.length > 0}
        slidable={isRightSlidable}
        direction={'right'}
      />
    </PanelWrap>
  );
};
