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

/* eslint-disable max-lines-per-function -- no need fix */
/* eslint-disable @typescript-eslint/no-magic-numbers -- no need fix */
import { useCallback, useState, useEffect } from 'react';

import { type FormModelV2 } from '@flowgram-adapter/free-layout-editor';
import {
  FreeOperationType,
  HistoryService,
} from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import {
  TransformData,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';
import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';

import { CommentEditorFormField } from '../constant';

export const useSize = () => {
  const node = useCurrentEntity();
  const nodeMeta = node.getNodeMeta();
  const playground = usePlayground();
  const historyService = useService(HistoryService);
  const { size = { width: 240, height: 150 } } = nodeMeta;
  const transform = node.getData(TransformData);
  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const formSize = formModel.getValueIn<{ width: number; height: number }>(
    CommentEditorFormField.Size,
  );

  const [width, setWidth] = useState(formSize?.width ?? size.width);
  const [height, setHeight] = useState(formSize?.height ?? size.height);

  // Initialize form value
  useEffect(() => {
    const initSize = formModel.getValueIn<{ width: number; height: number }>(
      CommentEditorFormField.Size,
    );
    if (!initSize) {
      formModel.setValueIn(CommentEditorFormField.Size, {
        width,
        height,
      });
    }
  }, [formModel, width, height]);

  // Synchronize form external value changes: initialize/undo/redo/coordinate
  useEffect(() => {
    const disposer = formModel.onFormValuesChange(({ name }) => {
      if (name !== CommentEditorFormField.Size) {
        return;
      }
      const newSize = formModel.getValueIn<{ width: number; height: number }>(
        CommentEditorFormField.Size,
      );
      if (!newSize) {
        return;
      }
      setWidth(newSize.width);
      setHeight(newSize.height);
    });
    return () => disposer.dispose();
  }, [formModel]);

  const onResize = useCallback(() => {
    const resizeState = {
      width,
      height,
      originalWidth: width,
      originalHeight: height,
      positionX: transform.position.x,
      positionY: transform.position.y,
      offsetX: 0,
      offsetY: 0,
    };
    const resizing = (delta: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    }) => {
      if (!resizeState) {
        return;
      }

      const { zoom } = playground.config;

      const top = delta.top / zoom;
      const right = delta.right / zoom;
      const bottom = delta.bottom / zoom;
      const left = delta.left / zoom;

      const minWidth = 120;
      const minHeight = 80;

      const newWidth = Math.max(
        minWidth,
        resizeState.originalWidth + right - left,
      );
      const newHeight = Math.max(
        minHeight,
        resizeState.originalHeight + bottom - top,
      );

      // If the width or height is less than the minimum, the offset is not updated
      const newOffsetX =
        (left > 0 || right < 0) && newWidth <= minWidth
          ? resizeState.offsetX
          : left / 2 + right / 2;
      const newOffsetY =
        (top > 0 || bottom < 0) && newHeight <= minHeight
          ? resizeState.offsetY
          : top;

      const newPositionX = resizeState.positionX + newOffsetX;
      const newPositionY = resizeState.positionY + newOffsetY;

      resizeState.width = newWidth;
      resizeState.height = newHeight;
      resizeState.offsetX = newOffsetX;
      resizeState.offsetY = newOffsetY;

      // update status
      setWidth(newWidth);
      setHeight(newHeight);

      // Update Offset
      transform.update({
        position: {
          x: newPositionX,
          y: newPositionY,
        },
      });
    };

    const resizeEnd = () => {
      historyService.transact(() => {
        historyService.pushOperation(
          {
            type: FreeOperationType.dragNodes,
            value: {
              ids: [node.id],
              value: [
                {
                  x: resizeState.positionX + resizeState.offsetX,
                  y: resizeState.positionY + resizeState.offsetY,
                },
              ],
              oldValue: [
                {
                  x: resizeState.positionX,
                  y: resizeState.positionY,
                },
              ],
            },
          },
          {
            noApply: true,
          },
        );
        formModel.setValueIn(CommentEditorFormField.Size, {
          width: resizeState.width,
          height: resizeState.height,
        });
      });
    };

    return {
      resizing,
      resizeEnd,
    };
  }, [node, width, height, transform, playground, formModel, historyService]);

  return {
    width,
    height,
    onResize,
  };
};
