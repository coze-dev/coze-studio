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

import { useCallback, useEffect, useState } from 'react';

import { Canvas, type FabricObject } from 'fabric';
import { useAsyncEffect, useUnmount } from 'ahooks';

import { loadFontWithSchema, setElementAfterLoad } from '../utils';
import { type FabricClickEvent, type FabricSchema } from '../typings';

export const useInitCanvas = ({
  startInit,
  ref,
  schema,
  readonly,
  resize,
  scale = 1,
  onClick,
}: {
  startInit: boolean;
  ref: HTMLCanvasElement | null;
  schema: FabricSchema;
  readonly: boolean;
  resize?: (canvas: Canvas) => void;
  scale?: number;
  onClick?: (e: FabricClickEvent) => void;
}) => {
  const [canvas, setCanvas] = useState<Canvas | undefined>(undefined);

  useAsyncEffect(async () => {
    if (!startInit || !ref) {
      return;
    }

    // Give an initial height proportionally, and then correct it to the true width and height by resizing.
    const _canvas = new Canvas(ref, {
      width: schema.width * scale,
      height: schema.height * scale,
      backgroundColor: schema.backgroundColor as string,
      selection: !readonly,
      preserveObjectStacking: true,
    });
    resize?.(_canvas);

    await loadFromJSON(schema, _canvas);

    setCanvas(_canvas);

    loadFontWithSchema({
      schema,
      canvas: _canvas,
    });

    if (!readonly) {
      (
        window as unknown as {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _fabric_canvas: Canvas;
        }
      )._fabric_canvas = _canvas;
    }
  }, [startInit]);

  useUnmount(() => {
    canvas?.dispose();
    setCanvas(undefined);
  });

  const loadFromJSON = useCallback(
    async (_schema: FabricSchema, _canvas?: Canvas) => {
      const fabricCanvas = _canvas ?? canvas;
      await fabricCanvas?.loadFromJSON(
        JSON.stringify(_schema),
        async (elementSchema, element) => {
          // Callback after each element is loaded
          await setElementAfterLoad({
            element: element as FabricObject,
            options: { readonly },
            canvas: fabricCanvas,
          });
        },
      );
      fabricCanvas?.requestRenderAll();
    },
    [canvas],
  );

  useEffect(() => {
    const disposers: (() => void)[] = [];
    if (canvas) {
      disposers.push(
        canvas.on('mouse:down', e => {
          onClick?.(e);
        }),
      );
    }

    return () => {
      disposers.forEach(disposer => disposer());
    };
  }, [canvas, onClick]);

  return { canvas, loadFromJSON };
};
