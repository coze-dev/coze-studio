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

import type { CommentEditorModel } from '../model';
import { ResizeArea } from './resize-area';
import { DragArea } from './drag-area';

interface IBorderArea {
  model: CommentEditorModel;
  overflow: boolean;
  onResize?: () => {
    resizing: (delta: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }) => void;
    resizeEnd: () => void;
  };
}

export const BorderArea: FC<IBorderArea> = props => {
  const { model, overflow, onResize } = props;

  return (
    <div className="workflow-comment-border-area z-[999]">
      {/* Left */}
      <DragArea
        className="left-[-10px] top-[10px] w-[20px] h-[calc(100%-20px)]"
        model={model}
      />
      {/* Right */}
      <DragArea
        className={classNames('right-[-10px] top-[10px] h-[calc(100%-20px)]', {
          'w-[10px]': overflow, // Prevent occlusion of scroll bars
          'w-[20px]': !overflow,
        })}
        model={model}
      />
      {/* above */}
      <DragArea
        className="top-[-10px] left-[10px] w-[calc(100%-20px)] h-[20px]"
        model={model}
      />
      {/* below */}
      <DragArea
        className="bottom-[-10px] left-[10px] w-[calc(100%-20px)] h-[20px]"
        model={model}
      />
      {/** upper left corner */}
      <ResizeArea
        className="left-0 top-0 cursor-nwse-resize"
        model={model}
        getDelta={({ x, y }) => ({ top: y, right: 0, bottom: 0, left: x })}
        onResize={onResize}
      />
      {/** upper right corner */}
      <ResizeArea
        className="right-0 top-0 cursor-nesw-resize"
        model={model}
        getDelta={({ x, y }) => ({ top: y, right: x, bottom: 0, left: 0 })}
        onResize={onResize}
      />
      {/** lower right corner */}
      <ResizeArea
        className="right-0 bottom-0 cursor-nwse-resize"
        model={model}
        getDelta={({ x, y }) => ({ top: 0, right: x, bottom: y, left: 0 })}
        onResize={onResize}
      />
      {/** Lower left corner */}
      <ResizeArea
        className="left-0 bottom-0 cursor-nesw-resize"
        model={model}
        getDelta={({ x, y }) => ({ top: 0, right: 0, bottom: y, left: x })}
        onResize={onResize}
      />
    </div>
  );
};
