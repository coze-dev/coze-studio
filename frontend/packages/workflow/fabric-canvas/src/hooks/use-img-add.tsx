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

import { type Canvas } from 'fabric';

import { createElement, defaultProps } from '../utils';
import { type FabricObjectWithCustomProps, Mode } from '../typings';

export const useImagAdd = ({
  canvas,
  onShapeAdded,
}: {
  canvas?: Canvas;
  onShapeAdded?: (data: { element: FabricObjectWithCustomProps }) => void;
}) => {
  const addImage = async (url: string) => {
    const img = await createElement({
      mode: Mode.IMAGE,
      position: [
        (canvas?.width as number) / 2 -
          (defaultProps[Mode.IMAGE].width as number) / 2,
        (canvas?.height as number) / 2 -
          (defaultProps[Mode.IMAGE].height as number) / 2,
      ],
      canvas,
      elementProps: {
        src: url,
      },
    });
    if (img) {
      canvas?.add(img);
      canvas?.setActiveObject(img);
      onShapeAdded?.({ element: img as FabricObjectWithCustomProps });
    }
  };
  return {
    addImage,
  };
};
