import { useEffect, useState } from 'react';

import { type Canvas } from 'fabric';
import { useDebounceEffect } from 'ahooks';

import { type FabricSchema } from '../typings';

export const useBackground = ({
  canvas,
  schema,
}: {
  canvas?: Canvas;
  schema: FabricSchema;
}) => {
  const [backgroundColor, setBackgroundColor] = useState<string>();

  useEffect(() => {
    if (!canvas) {
      return;
    }

    setBackgroundColor(
      (canvas as unknown as { backgroundColor: string }).backgroundColor,
    );
  }, [canvas]);

  // 防抖的作用在于，form.schema.backgroundColor 的变化是异步的，setBackgroundColor 是同步的，两者可能会打架
  useDebounceEffect(
    () => {
      setBackgroundColor(schema.backgroundColor as string);
    },
    [schema.backgroundColor],
    {
      wait: 300,
    },
  );

  useEffect(() => {
    if (
      backgroundColor &&
      canvas &&
      (canvas as unknown as { backgroundColor: string }).backgroundColor !==
        backgroundColor
    ) {
      canvas.set({
        backgroundColor,
      });
      canvas.fire('object:modified');
      canvas.requestRenderAll();
    }
  }, [backgroundColor, canvas]);

  return {
    backgroundColor,
    setBackgroundColor,
  };
};
