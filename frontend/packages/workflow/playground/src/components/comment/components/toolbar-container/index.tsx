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

import { type FC, type RefObject, useRef } from 'react';

import { CommentToolbar } from '../toolbar';
import type { CommentEditorModel } from '../../model';
import { usePosition } from './use-position';
import { useActivate } from './use-activate';
import { Portal } from './portal';

interface ICommentToolbar {
  disabled?: boolean;
  model: CommentEditorModel;
  containerRef: RefObject<HTMLDivElement>;
}

export const CommentToolbarContainer: FC<ICommentToolbar> = props => {
  const { disabled = false, model, containerRef } = props;
  const toolbarRef = useRef<HTMLDivElement>(null);
  const shouldRender = !!containerRef?.current;
  const activated = useActivate({ model, toolbarRef });
  const position = usePosition({ model, containerRef });
  const visible = activated && Boolean(position);

  if (!shouldRender || disabled) {
    return <></>;
  }

  return (
    <Portal container={containerRef.current}>
      <div
        className="workflow-comment-toolbar-container absolute z-[1000]"
        ref={toolbarRef}
        style={{
          display: visible ? 'flex' : 'none',
          top: position?.y,
          left: position?.x,
        }}
      >
        <CommentToolbar
          model={model}
          containerRef={containerRef}
          visible={visible}
        />
      </div>
    </Portal>
  );
};
