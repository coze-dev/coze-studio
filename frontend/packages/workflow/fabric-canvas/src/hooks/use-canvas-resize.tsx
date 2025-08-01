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

import { useCallback } from 'react';

import { type Canvas } from 'fabric';

export const useCanvasResize = ({
  maxWidth,
  maxHeight,
  width,
  height,
}: {
  maxWidth: number;
  maxHeight: number;
  width: number;
  height: number;
}) => {
  const scale = Math.min(maxWidth / width, maxHeight / height);

  const resize = useCallback(
    (canvas: Canvas | undefined) => {
      if (!maxWidth || !maxHeight || !canvas) {
        return;
      }

      canvas?.setDimensions({
        width,
        height,
      });

      canvas?.setDimensions(
        {
          width: `${width * scale}px`,
          height: `${height * scale}px`,
        },
        { cssOnly: true },
      );
    },
    [maxWidth, maxHeight, width, height, scale],
  );

  return { resize, scale };
};
