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

import { type RefObject, useState, useCallback, useEffect } from 'react';

import { ReactEditor } from 'slate-react';
import {
  type PositionSchema,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';

import type { CommentEditorModel } from '../../model';
import { CommentEditorEvent } from '../../constant';

export const usePosition = (params: {
  model: CommentEditorModel;
  containerRef: RefObject<HTMLDivElement>;
}): PositionSchema | undefined => {
  const { model, containerRef } = params;
  const playground = usePlayground();

  const [position, setPosition] = useState<PositionSchema | undefined>();

  const calcPosition = useCallback(() => {
    const containerRect = containerRef?.current?.getBoundingClientRect();
    if (!model.editor.selection || !containerRect) {
      setPosition(undefined);
      return;
    }
    const selectionRect = ReactEditor.toDOMRange(
      model.editor,
      model.editor.selection,
    ).getBoundingClientRect();

    const { zoom } = playground.config;
    const lineHeight = 24;

    const selectionWidth = selectionRect.width / zoom;
    const selectionX = selectionRect.left / zoom;
    const selectionY = selectionRect.top / zoom;
    const containerX = containerRect.left / zoom;
    const containerY = containerRect.top / zoom;

    const positionX = selectionX - containerX + selectionWidth / 2;
    const positionY = selectionY - containerY - lineHeight;

    const selectionPosition: PositionSchema = {
      x: positionX,
      y: positionY,
    };
    setPosition(selectionPosition);
  }, [containerRef, model.editor, playground.config]);

  useEffect(() => {
    calcPosition();
    const multiSelectDispose = model.on<CommentEditorEvent.MultiSelect>(
      CommentEditorEvent.MultiSelect,
      () => {
        calcPosition();
      },
    );
    const changeDispose = model.on<CommentEditorEvent.Change>(
      CommentEditorEvent.Change,
      () => {
        setTimeout(() => {
          calcPosition();
        }, 20);
      },
    );
    return () => {
      multiSelectDispose();
      changeDispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init
  }, []);

  return position;
};
