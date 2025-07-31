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

import { type CommentEditorModel } from '../model';

interface IDragArea {
  className?: string;
  model: CommentEditorModel;
  stopEvent?: boolean;
}

export const DragArea: FC<IDragArea> = props => {
  const { className = '', model, stopEvent = true } = props;

  const playground = usePlayground();

  const {
    startDrag: onStartDrag,
    onFocus,
    onBlur,
    selectNode,
  } = useNodeRender();

  return (
    <div
      className={classNames(
        'workflow-comment-drag-area',
        'absolute flex items-center justify-center cursor-move',
        className,
      )}
      data-flow-editor-selectable="false"
      draggable={true}
      onMouseDown={e => {
        if (stopEvent) {
          e.preventDefault();
          e.stopPropagation();
        }
        model.setFocus(false);
        onStartDrag(e);
        selectNode(e);
        playground.node.focus(); // Prevent nodes from being deleted
      }}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};
