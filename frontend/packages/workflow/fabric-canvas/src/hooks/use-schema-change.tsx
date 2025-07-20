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

import { type Canvas, type FabricObject } from 'fabric';

import { setElementAfterLoad } from '../utils';
import { type FabricSchema } from '../typings';

/**
 * 监听 schema 变化，reload canvas
 * 仅只读态需要
 */
export const useSchemaChange = ({
  canvas,
  schema,
  readonly,
}: {
  canvas: Canvas | undefined;
  schema: FabricSchema;
  readonly: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    canvas
      ?.loadFromJSON(JSON.stringify(schema), (elementSchema, element) => {
        // 这里是 schema 中每个元素被加载后的回调
        setElementAfterLoad({
          element: element as FabricObject,
          options: { readonly },
          canvas,
        });
      })
      .then(() => {
        setLoading(false);
        canvas?.requestRenderAll();
      });
  }, [schema, canvas]);

  return {
    loading,
  };
};
