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

import { type FC, useState, useEffect, type WheelEventHandler } from 'react';

import classNames from 'classnames';
import {
  useNodeRender,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';

import type { CommentEditorModel } from '../model';
import { DragArea } from './drag-area';

interface IContentDragArea {
  model: CommentEditorModel;
  focused: boolean;
  overflow: boolean;
}

export const ContentDragArea: FC<IContentDragArea> = props => {
  const { model, focused, overflow } = props;
  const playground = usePlayground();
  const { selectNode } = useNodeRender();

  const [active, setActive] = useState(false);

  useEffect(() => {
    // When the editor loses focus, deactivate it
    if (!focused) {
      setActive(false);
    }
  }, [focused]);

  const handleWheel: WheelEventHandler<HTMLDivElement> = e => {
    const containerElement = model.element?.parentElement;
    if (active || !overflow || !containerElement) {
      return;
    }
    e.stopPropagation();
    const maxScroll =
      containerElement.scrollHeight - containerElement.clientHeight;
    const newScrollTop = Math.min(
      Math.max(containerElement.scrollTop + e.deltaY, 0),
      maxScroll,
    );
    containerElement.scroll(0, newScrollTop);
  };

  const handleMouseDown = (mouseDownEvent: React.MouseEvent) => {
    if (active) {
      return;
    }
    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();
    model.setFocus(false);
    selectNode(mouseDownEvent);
    playground.node.focus(); // Prevent nodes from being deleted

    const startX = mouseDownEvent.clientX;
    const startY = mouseDownEvent.clientY;

    const handleMouseUp = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const deltaY = mouseMoveEvent.clientY - startY;
      // Determine whether to drag or click
      const delta = 5;
      if (Math.abs(deltaX) < delta && Math.abs(deltaY) < delta) {
        // Hide after clicking
        setActive(true);
      }
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleMouseUp);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleMouseUp);
  };

  return (
    <div
      className={classNames(
        'workflow-comment-content-drag-area absolute h-full w-[calc(100%-20px)]',
        {
          hidden: active,
        },
      )}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <DragArea
        className="relative h-full w-full"
        model={model}
        stopEvent={false}
      />
    </div>
  );
};
