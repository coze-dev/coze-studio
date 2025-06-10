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
