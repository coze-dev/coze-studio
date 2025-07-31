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

  // The effect of stabilization is that the change of form.schema.backgroundColor is asynchronous, and the change of setBackgroundColor is synchronous, and the two may fight
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
