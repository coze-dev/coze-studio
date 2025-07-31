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

import { type FC } from 'react';

import classNames from 'classnames';
import {
  useNodeRender,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';

import type { CommentEditorModel } from '../model';

interface IResizeArea {
  className?: string;
  model: CommentEditorModel;
  onResize?: () => {
    resizing: (delta: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }) => void;
    resizeEnd: () => void;
  };
  getDelta?: (delta: { x: number; y: number }) => {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export const ResizeArea: FC<IResizeArea> = props => {
  const { className = '', model, onResize, getDelta } = props;

  const playground = usePlayground();

  const { selectNode } = useNodeRender();

  const handleMouseDown = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();
    if (!onResize) {
      return;
    }
    const { resizing, resizeEnd } = onResize();
    model.setFocus(false);
    selectNode(mouseDownEvent);
    playground.node.focus(); // Prevent nodes from being deleted

    const startX = mouseDownEvent.clientX;
    const startY = mouseDownEvent.clientY;

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      const deltaY = mouseMoveEvent.clientY - startY;
      const delta = getDelta?.({ x: deltaX, y: deltaY });
      if (!delta || !resizing) {
        return;
      }
      resizing(delta);
    };

    const handleMouseUp = () => {
      resizeEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleMouseUp);
  };

  return (
    <div
      className={classNames(
        className,
        'workflow-comment-resize-area absolute w-[10px] h-[10px]',
      )}
      data-flow-editor-selectable="false"
      onMouseDown={handleMouseDown}
    ></div>
  );
};
