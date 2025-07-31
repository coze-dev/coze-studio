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

import React, { useState, type ForwardedRef } from 'react';

import classNames from 'classnames';
import { type Workflow } from '@coze-arch/idl/workflow_api';
import {
  InteractiveType,
  getPreferInteractiveType,
} from '@coze-common/mouse-pad-selector';

import { useTemplateService } from '@/hooks/use-template-service';

import { TemplateCard } from './template-card';

import styles from './index.module.less';

interface TemplateCardListProps {
  workflowTemplateList: Workflow[];
  isCardsOver: boolean;
}

export const TemplateCardList = React.forwardRef(
  (props: TemplateCardListProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { workflowTemplateList, isCardsOver } = props;
    const [isDragActive, setDragActive] = useState(false);
    const [startX, setStartX] = useState(0);
    const [isMove, setMove] = useState(false);

    const templateState = useTemplateService();

    const isMouseMode = getPreferInteractiveType() === InteractiveType.Mouse;

    const handleMouseDown = event => {
      const curRef = (ref as React.RefObject<HTMLDivElement>)?.current;
      if (!curRef || !isMouseMode) {
        return;
      }
      setDragActive(true);
      setStartX(event.clientX);
    };

    const handleMouseUp = event => {
      if (!isMouseMode) {
        return;
      }
      if (isDragActive) {
        event.preventDefault();
      }
      setStartX(0);
      setDragActive(false);
    };

    const handleMouseMove = event => {
      event.preventDefault();
      const curRef = (ref as React.RefObject<HTMLDivElement>)?.current;
      const walk = (event.clientX - startX) * 0.1; // Control rolling speed

      // mouseDown, the mouse movement starts to drag
      setMove(isDragActive && !!walk);

      if (!isDragActive || !curRef || !isMouseMode) {
        return;
      }
      curRef.scrollLeft = curRef?.scrollLeft - walk;
    };

    const handleCardBlur = () => {
      templateState.closePreview();
    };
    const handleCardFouce = templateInfo => {
      // If you are dragging, show a preview example
      if (isDragActive) {
        return;
      }
      templateState.openPreview(templateInfo);
    };

    return (
      <>
        <div className="w-[16px]" />
        <div
          ref={ref as { current: HTMLDivElement | null }}
          className={classNames(
            'flex flex-1  gap-[13px] overflow-x-scroll overflow-y-hidden',
            // Card height 116 + 8px to avoid shadows being cut
            'w-0 h-[124px] pt-[8px]',
            styles['list-container'],
            isCardsOver ? 'justify-start' : 'justify-center',
            {
              'cursor-grabbing': isMouseMode && isDragActive,
            },
          )}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {workflowTemplateList?.map((templateInfo, index) => (
            <TemplateCard
              key={templateInfo.workflow_id}
              workflowTemplate={templateInfo}
              cardIndex={index}
              onBlur={handleCardBlur}
              onFocus={handleCardFouce}
              isDragActive={isDragActive}
              isMove={isMove}
            />
          ))}
        </div>
        <div className="w-[16px]" />
      </>
    );
  },
);
