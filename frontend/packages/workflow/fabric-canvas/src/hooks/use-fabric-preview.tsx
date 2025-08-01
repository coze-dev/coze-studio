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

import { useEffect } from 'react';

import { type FabricSchema } from '../typings';
import { useSchemaChange } from './use-schema-change';
import { useInitCanvas } from './use-init-canvas';
import { useCanvasResize } from './use-canvas-resize';

export const useFabricPreview = ({
  ref,
  schema,
  maxWidth,
  maxHeight,
  startInit,
}: {
  ref: React.RefObject<HTMLCanvasElement>;
  schema: FabricSchema;
  maxWidth: number;
  maxHeight: number;
  startInit: boolean;
}) => {
  const { resize, scale } = useCanvasResize({
    maxWidth,
    maxHeight,
    width: schema.width,
    height: schema.height,
  });

  const { canvas } = useInitCanvas({
    ref: ref.current,
    schema,
    startInit,
    readonly: true,
    resize,
    scale,
  });

  useEffect(() => {
    if (canvas) {
      resize(canvas);
    }
  }, [resize, canvas]);

  useSchemaChange({
    canvas,
    schema,
    readonly: true,
  });

  return {
    state: {
      cssScale: scale,
    },
  };
};
