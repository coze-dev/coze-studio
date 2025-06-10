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

    // 按比例给个初始化高度，随后会通过 resize 修正为真正的宽高
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
          // 每个元素被加载后的回调
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
